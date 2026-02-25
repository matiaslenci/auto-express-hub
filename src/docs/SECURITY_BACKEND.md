# Recomendaciones de Seguridad — Backend

Este documento lista los problemas de seguridad detectados en la auditoría del frontend que **requieren cambios en el backend** para ser resueltos correctamente.

---

## 1. Token JWT en `localStorage` (A-2)

### Problema

El token JWT se almacena en `localStorage`, que es accesible desde cualquier script JavaScript en la página. Si existe una vulnerabilidad XSS (incluyendo en librerías de terceros), un atacante puede robar el token:

```js
localStorage.getItem('agencia_express_token');
```

### Solución recomendada

Migrar a cookies `HttpOnly` manejadas por el backend:

1. **En el login/register del backend**: en lugar de devolver `{ access_token: '...' }`, setear una cookie:

```ts
// auth.controller.ts
@Post('login')
async login(@Body() dto: LoginDto, @Res() res: Response) {
  const result = await this.authService.login(dto);

  res.cookie('auth_token', result.access_token, {
    httpOnly: true,    // No accesible desde JS
    secure: true,      // Solo HTTPS
    sameSite: 'strict', // Protección CSRF
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    path: '/',
  });

  return res.json({ agency: result.agency });
}
```

2. **En el JwtStrategy**: extraer el token de la cookie en lugar del header Authorization:

```ts
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.auth_token || null,
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }
}
```

3. **Instalar `cookie-parser`** en el backend:

```bash
npm install cookie-parser
npm install -D @types/cookie-parser
```

```ts
// main.ts
import * as cookieParser from 'cookie-parser';
app.use(cookieParser());
```

4. **En el frontend**: eliminar toda la lógica de `localStorage` para el token. El browser enviará la cookie automáticamente con `axios` si se configura `withCredentials: true`:

```ts
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
```

---

## 2. JWT decodificado client-side sin verificar firma (A-1)

### Problema

En `AuthContext.tsx`, el frontend decodifica el JWT con `atob()` para leer el payload (username, exp). Esto no verifica la firma; un token manipulado en `localStorage` pasaría la verificación del cliente.

### Solución recomendada

Crear un endpoint `/auth/me` en el backend que devuelva los datos del usuario autenticado:

```ts
// auth.controller.ts
@Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@Req() req) {
  return this.agencyService.findById(req.user.sub);
}
```

En el frontend, reemplazar la decodificación del token por una llamada a `/auth/me`:

```ts
// AuthContext.tsx reemplazar loadUser()
const loadUser = async () => {
  try {
    const agency = await apiClient.get('/auth/me');
    setUser(agency.data);
  } catch {
    // No autenticado, no hacer nada
  }
  setLoading(false);
};
```

---

## 3. Validaciones de inputs solo en el cliente (M-2)

### Problema

El formulario de registro (`Register.tsx`) valida la contraseña con un regex y sanitiza el username client-side, pero un atacante puede enviar requests directamente al backend usando `curl` o Postman, bypaseando todas las validaciones del frontend.

### Solución recomendada

Agregar las mismas validaciones en los DTOs del backend usando `class-validator`:

```ts
// create-agency.dto.ts (o register.dto.ts)
import { IsEmail, Matches, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
    { message: 'La contraseña debe incluir mayúscula, minúscula, número y carácter especial' }
  )
  password: string;

  @Matches(/^[a-z0-9_-]+$/, {
    message: 'El username solo puede contener letras minúsculas, números, guiones y guiones bajos'
  })
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  username: string;

  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsIn(['basico', 'profesional', 'premium'], {
    message: 'El plan debe ser basico, profesional o premium'
  })
  plan: string;
}
```

> **Verificar:** que el backend tenga el `ValidationPipe` global activado en `main.ts`:
> ```ts
> app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
> ```
