import { useState } from 'react';
import { Crown, AlertTriangle, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLAN_NAMES, WHATSAPP_SUPPORT } from '@/lib/storage';

interface PlanLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: 'basico' | 'profesional' | 'premium';
    limite: number;
}

export function PlanLimitModal({ isOpen, onClose, plan, limite }: PlanLimitModalProps) {
    if (!isOpen) return null;

    const planName = PLAN_NAMES[plan] || 'Básico';
    const message = encodeURIComponent(
        `Hola! Me gustaría actualizar mi plan de CatálogoVehículos. Actualmente tengo el plan ${planName} y me gustaría conocer las opciones disponibles.`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_SUPPORT.replace(/[^0-9]/g, '')}?text=${message}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 glass-card p-6 animate-fade-in-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-warning/10">
                        <AlertTriangle className="h-10 w-10 text-warning" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                    <h2 className="text-xl font-bold">Límite de publicaciones alcanzado</h2>
                    <p className="text-muted-foreground">
                        Has alcanzado el límite de <span className="font-semibold text-foreground">{limite} publicaciones</span> de tu plan{' '}
                        <span className="font-semibold text-primary">{planName}</span>.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Actualiza tu plan para publicar más vehículos y llegar a más clientes.
                    </p>
                </div>

                {/* Plan comparison hint */}
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                        <Crown className="h-6 w-6 text-primary flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium">¿Necesitas más publicaciones?</p>
                            <p className="text-muted-foreground">
                                Plan Profesional: 50 | Plan Premium: Ilimitadas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cerrar
                    </Button>
                    <Button
                        variant="gradient"
                        onClick={() => window.open(whatsappUrl, '_blank')}
                        className="flex-1 gap-2"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Actualizar plan
                    </Button>
                </div>
            </div>
        </div>
    );
}
