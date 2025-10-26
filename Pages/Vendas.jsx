
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Download, Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Vendas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list("-created_date"),
  });

  const filteredSales = sales.filter(sale =>
    sale.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const exportToCSV = () => {
    const headers = "Número,Data,Cliente,Vendedor,Tipo,Itens,Total\n";
    const rows = filteredSales.map(sale => 
      `${sale.number},${format(new Date(sale.created_date), 'dd/MM/yyyy HH:mm')},${sale.client_name},${sale.seller_name},${sale.negotiation_type_name},${sale.items?.length || 0},R$ ${sale.total.toFixed(2)}`
    ).join("\n");
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vendas_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Consultar Vendas</h1>
              <p className="text-gray-600 mt-1">Visualize e exporte o histórico de vendas</p>
            </div>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="gap-2"
            disabled={sales.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Histórico de Vendas</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por número, cliente ou vendedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full mb-3" />
                ))}
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>Nenhuma venda encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Número</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-center">Itens</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.number}</TableCell>
                        <TableCell>
                          {format(new Date(sale.created_date), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{sale.client_name}</TableCell>
                        <TableCell>{sale.seller_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {sale.negotiation_type_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-800">
                            {sale.items?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          R$ {sale.total?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(sale)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {showDetails && selectedSale && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalhes da Venda - {selectedSale.number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-medium">{selectedSale.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vendedor</p>
                    <p className="font-medium">{selectedSale.seller_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Negociação</p>
                    <p className="font-medium">{selectedSale.negotiation_type_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data/Hora</p>
                    <p className="font-medium">
                      {format(new Date(selectedSale.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Itens da Venda</h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSale.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-sm text-gray-600">Cód: {item.product_code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">R$ {item.unit_price?.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            R$ {item.subtotal?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-bold">
                        <TableCell colSpan={3} className="text-right">Total:</TableCell>
                        <TableCell className="text-right text-lg text-green-600">
                          R$ {selectedSale.total?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
