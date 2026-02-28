import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useVehicle, useUpdateVehicle } from '@/hooks/useVehicles';
import { useUploadVehicleImage } from '@/hooks/useUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Plus, X, Image as ImageIcon, Upload, Star } from 'lucide-react';
import { SEO } from '@/components/common/SEO';

import {
    TIPOS_AUTO, TIPOS_MOTO, TRANSMISIONES, COMBUSTIBLES, COLORES, MONEDAS,
    MARCAS_AUTO, MARCAS_MOTO,
} from '@/lib/constants';

export default function DashboardEditVehicle() {
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: vehicle, isLoading: vehicleLoading } = useVehicle(vehicleId || '');
    const updateVehicleMutation = useUpdateVehicle();
    const { uploadAsync, isUploading } = useUploadVehicleImage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        tipoVehiculo: 'AUTO' as 'AUTO' | 'MOTO',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        precio: null as number | null,
        moneda: 'ARS' as 'ARS' | 'USD' | 'CONSULTAR',
        tipo: '',
        transmision: '',
        combustible: '',
        kilometraje: 0,
        color: '',
        descripcion: '',
        localidad: '',
        fotos: [] as string[],
        es0km: false,
    });

    const [initialized, setInitialized] = useState(false);
    const [marcaPersonalizada, setMarcaPersonalizada] = useState('');

    // Load vehicle data into form
    useEffect(() => {
        if (vehicle && !initialized) {
            // Verificar si la marca del vehículo está en la lista predefinida
            const tipoVeh = vehicle.tipoVehiculo || 'AUTO';
            const marcasList = tipoVeh === 'MOTO' ? MARCAS_MOTO : MARCAS_AUTO;
            const marcaEnLista = marcasList.includes(vehicle.marca || '');

            setFormData({
                tipoVehiculo: vehicle.tipoVehiculo || 'AUTO',
                marca: marcaEnLista ? (vehicle.marca || '') : 'Otro',
                modelo: vehicle.modelo || '',
                anio: vehicle.anio || new Date().getFullYear(),
                precio: vehicle.precio != null ? Math.trunc(vehicle.precio) : null,
                moneda: vehicle.moneda || 'ARS',
                tipo: vehicle.tipo || '',
                transmision: vehicle.transmision || '',
                combustible: vehicle.combustible || '',
                kilometraje: vehicle.kilometraje || 0,
                color: vehicle.color || '',
                descripcion: vehicle.descripcion || '',
                localidad: vehicle.localidad || '',
                fotos: vehicle.fotos || [],
                es0km: vehicle.kilometraje === 0,
            });

            // Si la marca no está en la lista, guardarla como marca personalizada
            if (!marcaEnLista && vehicle.marca) {
                setMarcaPersonalizada(vehicle.marca);
            }

            setInitialized(true);
        }
    }, [vehicle, initialized]);

    if (authLoading || vehicleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!vehicle) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold mb-2">Vehículo no encontrado</h1>
                    <p className="text-muted-foreground mb-6">Este vehículo no existe o fue eliminado.</p>
                    <Button variant="gradient" onClick={() => navigate('/dashboard/vehiculos')}>
                        Volver a mis vehículos
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const isMoto = formData.tipoVehiculo === 'MOTO';
    const MARCAS = isMoto ? MARCAS_MOTO : MARCAS_AUTO;
    const TIPOS = isMoto ? TIPOS_MOTO : TIPOS_AUTO;
    const modeloPlaceholder = isMoto ? 'Ej: CB 250 Twister, YBR 125' : 'Ej: Corolla, Civic, Serie 3';

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTipoVehiculoChange = (v: 'AUTO' | 'MOTO') => {
        setFormData(prev => ({ ...prev, tipoVehiculo: v, marca: '', tipo: '' }));
        setMarcaPersonalizada('');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            if (formData.fotos.length >= 10) {
                toast({
                    title: 'Límite alcanzado',
                    description: 'Máximo 20 fotos por vehículo.',
                    variant: 'destructive',
                });
                break;
            }

            try {
                const response = await uploadAsync(file);
                setFormData(prev => ({ ...prev, fotos: [...prev.fotos, response.url] }));
            } catch (error: any) {
                toast({
                    title: 'Error al subir imagen',
                    description: error.message || 'No se pudo subir la imagen.',
                    variant: 'destructive',
                });
            }
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            fotos: prev.fotos.filter((_, i) => i !== index),
        }));
    };

    const setAsCover = (index: number) => {
        if (index === 0) return; // Already cover
        setFormData(prev => {
            const newFotos = [...prev.fotos];
            const [photo] = newFotos.splice(index, 1);
            newFotos.unshift(photo);
            return { ...prev, fotos: newFotos };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Usar marca personalizada si se seleccionó "Otro"
        const marcaFinal = formData.marca === 'Otro' ? marcaPersonalizada : formData.marca;

        if (formData.marca === 'Otro' && !marcaPersonalizada.trim()) {
            toast({
                title: 'Error',
                description: 'Por favor ingresa el nombre de la marca.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const { es0km, ...vehicleData } = formData;
            await updateVehicleMutation.mutateAsync({
                id: vehicleId!,
                data: {
                    ...vehicleData,
                    marca: marcaFinal,
                },
            });

            toast({
                title: '¡Vehículo actualizado!',
                description: 'Los cambios han sido guardados.',
            });

            navigate('/dashboard/vehiculos');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'No se pudo actualizar el vehículo.',
                variant: 'destructive',
            });
        }
    };

    return (
        <DashboardLayout>
            <SEO title="Editar Vehículo | CatálogoVehículos" description="Edita los datos de tu vehículo." />
            <div className="max-w-3xl mx-auto">
                <div className="dashboard-page-header flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="back-button"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1>Editar vehículo</h1>
                        <p>{vehicle.marca} {vehicle.modelo}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="form-card animate-fade-in-up">
                        <h2 className="section-title">Información básica</h2>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Tipo de vehículo *</Label>
                                <Select value={formData.tipoVehiculo} onValueChange={handleTipoVehiculoChange} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tipo de vehículo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AUTO">🚗 Auto</SelectItem>
                                        <SelectItem value="MOTO">🏍️ Moto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="marca">Marca *</Label>
                                <Select value={formData.marca} onValueChange={(v) => {
                                    updateField('marca', v);
                                    if (v !== 'Otro') {
                                        setMarcaPersonalizada('');
                                    }
                                }} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MARCAS.map((marca) => (
                                            <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formData.marca === 'Otro' && (
                                    <Input
                                        id="marcaPersonalizada"
                                        placeholder="Ingresa el nombre de la marca"
                                        value={marcaPersonalizada}
                                        onChange={(e) => setMarcaPersonalizada(e.target.value)}
                                        required
                                        className="input-glow mt-2"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="modelo">Modelo *</Label>
                                <Input
                                    id="modelo"
                                    placeholder={modeloPlaceholder}
                                    value={formData.modelo}
                                    onChange={(e) => updateField('modelo', e.target.value)}
                                    required
                                    className="input-glow"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="anio">Año *</Label>
                                <Input
                                    id="anio"
                                    type="number"
                                    min={1990}
                                    max={new Date().getFullYear() + 1}
                                    value={formData.anio}
                                    onChange={(e) => updateField('anio', parseInt(e.target.value))}
                                    required
                                    className="input-glow"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Moneda *</Label>
                                <Select value={formData.moneda} onValueChange={(v: 'ARS' | 'USD' | 'CONSULTAR') => {
                                    updateField('moneda', v);
                                    if (v === 'CONSULTAR') {
                                        updateField('precio', null);
                                    }
                                }} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona moneda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONEDAS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.moneda !== 'CONSULTAR' && (
                                <div className="space-y-2">
                                    <Label htmlFor="precio">Precio ({formData.moneda === 'USD' ? 'USD' : 'ARS'}) *</Label>
                                    <Input
                                        id="precio"
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.precio ?? ''}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[.,\s]/g, '');
                                            updateField('precio', raw === '' ? null : parseInt(raw, 10) || 0);
                                        }}
                                        required
                                        className="input-glow"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="form-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="section-title">Especificaciones</h2>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Tipo *</Label>
                                <Select value={formData.tipo} onValueChange={(v) => updateField('tipo', v)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS.map((tipo) => (
                                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Transmisión *</Label>
                                <Select value={formData.transmision} onValueChange={(v) => updateField('transmision', v)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona transmisión" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRANSMISIONES.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Combustible *</Label>
                                <Select value={formData.combustible} onValueChange={(v) => updateField('combustible', v)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona combustible" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMBUSTIBLES.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Color *</Label>
                                <Select value={formData.color} onValueChange={(v) => updateField('color', v)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLORES.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kilometraje">Kilometraje</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="kilometraje"
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.kilometraje || ''}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[.,\s]/g, '');
                                            updateField('kilometraje', parseInt(raw, 10) || 0);
                                        }}
                                        className="input-glow flex-1"
                                        placeholder="0"
                                        disabled={formData.kilometraje === 0 && formData.es0km}
                                    />
                                    <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={formData.es0km || false}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    es0km: checked,
                                                    kilometraje: checked ? 0 : prev.kilometraje
                                                }));
                                            }}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium">0 km</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="localidad">Ubicación del vehículo</Label>
                                <Input
                                    id="localidad"
                                    placeholder="Ej: Santa Fe, Rosario, Córdoba"
                                    value={formData.localidad}
                                    onChange={(e) => updateField('localidad', e.target.value)}
                                    className="input-glow"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="section-title">Descripción</h2>
                        <Textarea
                            placeholder="Describe el vehículo, características especiales, historial de servicio, etc."
                            value={formData.descripcion}
                            onChange={(e) => updateField('descripcion', e.target.value)}
                            rows={4}
                            className="input-glow resize-none"
                        />
                    </div>

                    {/* Photos */}
                    <div className="form-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <h2 className="section-title">Fotos</h2>
                        <p className="text-sm text-muted-foreground">
                            Sube fotos del vehículo (máximo 20, formatos: JPG, PNG, WebP). Haz clic en la estrella para elegir la portada.
                        </p>

                        {/* Upload Button */}
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                id="photo-upload-edit"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || formData.fotos.length >= 10}
                                className="gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Subir fotos
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Photo Grid */}
                        {formData.fotos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {formData.fotos.map((foto, index) => (
                                    <div key={index} className={`relative group aspect-video rounded-lg overflow-hidden ${index === 0 ? 'ring-2 ring-primary' : ''}`}>
                                        <img
                                            src={foto}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-medium">
                                                Portada
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {index !== 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAsCover(index)}
                                                    className="p-1 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                                                    title="Establecer como portada"
                                                >
                                                    <Star className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="p-1 rounded-full bg-destructive text-destructive-foreground"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-xl">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Aún no hay fotos</p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="gradient"
                            className="flex-1"
                            disabled={updateVehicleMutation.isPending}
                        >
                            {updateVehicleMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar cambios'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
