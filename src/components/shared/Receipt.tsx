import { useRef } from 'react'
import { HiPrinter } from 'react-icons/hi2'

interface ReceiptProps {
    commande: {
        reference: string
        date_commande: string
        client_nom: string
        client_telephone: string
        client_adresse: string
        commerce_nom: string
        produits: { nom: string; quantite: number; prix: number; total: number }[]
        sous_total: number
        frais_livraison: number
        commission_plateforme: number
        total: number
        livreur_nom?: string
    }
    onClose: () => void
}

export default function Receipt({ commande, onClose }: ReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        if (receiptRef.current) {
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>Reçu ${commande.reference}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 20px; }
                .header h1 { color: #ea580c; margin: 0; }
                .header p { color: #666; margin: 5px 0; }
                .details { margin: 20px 0; }
                .details table { width: 100%; border-collapse: collapse; }
                .details td { padding: 8px 0; border-bottom: 1px solid #eee; }
                .details .right { text-align: right; }
                .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h1>Gagnoa Digital</h1>
                  <p>📋 Reçu de commande</p>
                </div>
                ${receiptRef.current?.innerHTML}
                <div class="footer">Merci pour votre confiance !</div>
              </div>
            </body>
          </html>
        `)
                printWindow.document.close()
                printWindow.print()
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                <div ref={receiptRef} className="space-y-4">
                    <div className="text-center border-b border-dashed pb-4">
                        <h2 className="text-2xl font-bold text-orange-500">Gagnoa Digital</h2>
                        <p className="text-sm text-slate-500">📋 Reçu de commande</p>
                        <p className="text-xs text-slate-400 font-mono">#{commande.reference}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Date</span>
                            <span>{new Date(commande.date_commande).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Client</span>
                            <span>{commande.client_nom}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Téléphone</span>
                            <span>{commande.client_telephone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Adresse</span>
                            <span className="text-right max-w-[60%]">{commande.client_adresse}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Commerce</span>
                            <span>{commande.commerce_nom}</span>
                        </div>
                        {commande.livreur_nom && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Livreur</span>
                                <span>{commande.livreur_nom}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">Détails de la commande</h4>
                        {commande.produits.map((p, i) => (
                            <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50">
                                <span>{p.nom} × {p.quantite}</span>
                                <span>{p.total.toLocaleString()} FCFA</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Sous-total</span>
                            <span>{commande.sous_total.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Frais de livraison</span>
                            <span>{commande.frais_livraison.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Commission</span>
                            <span>{commande.commission_plateforme.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total</span>
                            <span className="text-orange-500">{commande.total.toLocaleString()} FCFA</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <HiPrinter /> Imprimer
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}