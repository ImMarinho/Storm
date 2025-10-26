
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button"; // Added import for Button component

import SaleHeader from "../Components/sales/SaleHeader.js";
import ProductSelection from "../components/sales/ProductSelection";
import SaleCheckout from "../Components/sales/SaleCheckout.js/index.js";

export default function NovaVenda() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("header");
  const [saleHeader, setSaleHeader] = useState(null);
  const [cart, setCart] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleHeaderConfirm = (headerData) => {
    setSaleHeader(headerData);
    setActiveTab("products");
  };

  const handleProductsConfirm = () => {
    if (cart.length === 0) {
      alert("Adicione pelo menos um produto ao carrinho");
      return;
    }
    setActiveTab("checkout");
  };

  const handleSaleComplete = () => {
    setSaleHeader(null);
    setCart([]);
    setActiveTab("header");
    navigate(createPageUrl("Vendas"));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Venda</h1>
            <p className="text-gray-600">Registre uma nova venda no sistema</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="header">1. Cabeçalho</TabsTrigger>
                <TabsTrigger value="products" disabled={!saleHeader}>
                  2. Produtos
                </TabsTrigger>
                <TabsTrigger value="checkout" disabled={!saleHeader || cart.length === 0}>
                  3. Checkout
                </TabsTrigger>
              </TabsList>

              <TabsContent value="header">
                {saleHeader && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <AlertCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Cabeçalho confirmado! Prossiga para adicionar produtos.
                    </AlertDescription>
                  </Alert>
                )}
                <SaleHeader
                  onConfirm={handleHeaderConfirm}
                  initialData={saleHeader}
                  isLocked={!!saleHeader}
                />
              </TabsContent>

              <TabsContent value="products">
                <ProductSelection
                  cart={cart}
                  setCart={setCart}
                  onConfirm={handleProductsConfirm}
                />
              </TabsContent>

              <TabsContent value="checkout">
                <SaleCheckout
                  saleHeader={saleHeader}
                  cart={cart}
                  cartTotal={cartTotal}
                  user={user}
                  onComplete={handleSaleComplete}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
