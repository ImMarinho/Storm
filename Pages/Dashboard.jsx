import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, UserCircle, ShoppingCart, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list("-created_date", 10),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => base44.entities.User.list(),
    enabled: user?.role === 'SUP' || user?.role === 'ADMIN',
  });

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.created_date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  const todayTotal = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);

  const needsSetup = !user?.role || (user.role === 'user' && !user.phone);

  const stats = [
    {
      title: "Vendas Hoje",
      value: todaySales.length,
      subtitle: `R$ ${todayTotal.toFixed(2)}`,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      link: createPageUrl("Vendas")
    },
    {
      title: "Total em Vendas",
      value: `R$ ${totalSales.toFixed(2)}`,
      subtitle: `${sales.length} vendas`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      link: createPageUrl("Vendas")
    },
    {
      title: "Produtos Ativos",
      value: products.filter(p => p.active).length,
      subtitle: `${products.length} total`,
      icon: Package,
      color: "from-purple-500 to-purple-600",
      link: createPageUrl("Produtos")
    },
    {
      title: "Clientes Ativos",
      value: clients.filter(c => c.active).length,
      subtitle: `${clients.length} total`,
      icon: UserCircle,
      color: "from-orange-500 to-orange-600",
      link: createPageUrl("Clientes")
    },
  ];

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.full_name || 'Vendedor'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Aqui está um resumo das suas atividades
          </p>
        </div>

        {needsSetup && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Configuração inicial:</strong> Para começar a usar o sistema, você precisa configurar seu perfil. 
              Vá até a página de Vendedores e defina seu nível de acesso (SUP, ADMIN ou VENDEDOR).
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Vendas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sales.length > 0 ? (
                <div className="divide-y">
                  {sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{sale.number}</p>
                          <p className="text-sm text-gray-600">{sale.client_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(sale.created_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {sale.total?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {sale.items?.length || 0} itens
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Nenhuma venda registrada ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Link to={createPageUrl("NovaVenda")}>
                  <Button className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700 h-12">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">Nova Venda</span>
                  </Button>
                </Link>
                <Link to={createPageUrl("Produtos")}>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Gerenciar Produtos</span>
                  </Button>
                </Link>
                <Link to={createPageUrl("Clientes")}>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">Gerenciar Clientes</span>
                  </Button>
                </Link>
                {(user?.role === 'SUP' || user?.role === 'ADMIN') && (
                  <Link to={createPageUrl("Vendedores")}>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Gerenciar Vendedores</span>
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}