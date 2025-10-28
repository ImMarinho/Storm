import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Shield, AlertCircle, UserPlus, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SellerForm from "../Components/sellers/SellerForm.js";
import SellerTable from "../components/sellers/SellerTable";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Vendedores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => base44.entities.User.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });

  const filteredSellers = sellers.filter(seller =>
    seller.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (seller) => {
    if (seller.role === 'SUP' && currentUser?.email !== seller.email) {
      alert('Apenas o próprio SUP pode editar seus dados');
      return;
    }
    setSelectedSeller(seller);
    setShowForm(true);
  };

  const handleDelete = async (seller) => {
    if (seller.role === 'SUP') {
      alert('O usuário SUP não pode ser excluído');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir ${seller.full_name}?`)) {
      deleteMutation.mutate(seller.id);
    }
  };

  const canEditSeller = (seller) => {
    if (seller.role === 'SUP') {
      return currentUser?.email === seller.email;
    }
    return currentUser?.role === 'SUP' || currentUser?.role === 'ADMIN';
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
              <h1 className="text-3xl font-bold text-gray-900">Vendedores</h1>
              <p className="text-gray-600 mt-1">Gerencie os usuários do sistema</p>
            </div>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <UserPlus className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Importante:</strong> Para adicionar novos vendedores ao sistema, convide-os através do painel de administração
            (Dashboard → Data → Users → Invite User). Após o cadastro, você pode editar o perfil deles aqui para definir o nível de acesso e outras informações.
          </AlertDescription>
        </Alert>

        {currentUser?.role === 'SUP' && (
          <Alert className="border-purple-200 bg-purple-50">
            <Shield className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              Você está logado como SUP (Super Administrador). Apenas você pode editar seus próprios dados.
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-md">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Lista de Vendedores</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar vendedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <SellerTable
              sellers={filteredSellers}
              isLoading={isLoading}
              currentUser={currentUser}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEditSeller={canEditSeller}
            />
          </CardContent>
        </Card>

        {showForm && (
          <SellerForm
            seller={selectedSeller}
            onClose={() => {
              setShowForm(false);
              setSelectedSeller(null);
            }}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}