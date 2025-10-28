import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Package } from "lucide-react";
import { format } from "date-fns";

export default function SaleCheckout({ saleHeader, cart, cartTotal, user, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const createSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      return base44.entities.Sale.create(saleData);
    },
    onSuccess: () => {
      setIsProcessing(false);
      onComplete();
    },
    onError: () => {
      setIsProcessing(false);
      alert("Erro ao finalizar venda");
    },
  });

  const generateSaleNumber = () => {
    const today = format(new Date(), 'yyyyMMdd');
    const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `VEN-${today}-${random}`;
  };

  const handleFinalizeSale = async () => {
    setIsProcessing(true);

    const saleNumber = generateSaleNumber();
    
    const saleData = {
      number: saleNumber,
      seller_id: user.id,
      seller_name: user.full_name,
      client_id: saleHeader.client_id,
      client_name: saleHeader.client_name,
      negotiation_type_id: saleHeader.negotiation_type_id,
      negotiation_type_name: saleHeader.negotiation_type_name,
      total: cartTotal,
      status: "CONFIRMED",
      items: cart.map(item => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })),
    };

    createSaleMutation.mutate(saleData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{saleHeader.client_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo de Negociação</p>
              <p className="font-medium">{saleHeader.negotiation_type_name}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3">Produtos</p>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x R$ {item.unit_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    R$ {item.subtotal.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          onClick={handleFinalizeSale}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-lg py-6 px-8 gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Finalizando Venda...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Finalizar Venda
            </>
          )}
        </Button>
      </div>
    </div>
  );
}