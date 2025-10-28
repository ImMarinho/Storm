import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Plus, Shield, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import PermissionDialog from "../components/permissions/PermissionDialog";

const AVAILABLE_SCREENS = [
  { name: "Dashboard", displayName: "Dashboard" },
  { name: "Vendedores", displayName: "Vendedores" },
  { name: "Produtos", displayName: "Produtos" },
  { name: "Clientes", displayName: "Clientes" },
  { name: "Negociacoes", displayName: "Tipos de Negociação" },
  { name: "NovaVenda", displayName: "Nova Venda" },
  { name: "Vendas", displayName: "Consultar Vendas" },
];

export default function Acessos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.ScreenPermission.list(),
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (id) => base44.entities.ScreenPermission.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  const filteredScreens = AVAILABLE_SCREENS.filter(screen =>
    screen.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScreenPermissions = (screenName) => {
    return permissions.filter(p => p.screen_name === screenName);
  };

  const getUsersWithAccess = (screenName) => {
    const screenPermissions = getScreenPermissions(screenName);
    return users.filter(user => 
      screenPermissions.some(p => p.user_id === user.id)
    );
  };

  const getUsersWithoutAccess = (screenName) => {
    const usersWithAccess = getUsersWithAccess(screenName);
    return users.filter(user => 
      !usersWithAccess.some(u => u.id === user.id)
    );
  };

  const handleAddPermission = (screen) => {
    setSelectedScreen(screen);
    setSelectedPermission(null);
    setShowPermissionDialog(true);
  };

  const handleEditPermission = (screen, user) => {
    const permission = permissions.find(
      p => p.screen_name === screen.name && p.user_id === user.id
    );
    setSelectedScreen(screen);
    setSelectedPermission(permission);
    setShowPermissionDialog(true);
  };

  const handleDeletePermission = (screen, user) => {
    const permission = permissions.find(
      p => p.screen_name === screen.name && p.user_id === user.id
    );
    if (permission && confirm(`Remover acesso de ${user.full_name} à tela ${screen.displayName}?`)) {
      deletePermissionMutation.mutate(permission.id);
    }
  };

  const handleUserClick = (screen, user) => {
    if (confirm("Deseja editar ou remover a permissão?")) {
      handleEditPermission(screen, user);
    } else {
      handleDeletePermission(screen, user);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle de Acessos</h1>
            <p className="text-gray-600 mt-1">Gerencie as permissões de acesso às telas</p>
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Telas Disponíveis</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tela..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredScreens.map((screen) => {
                const usersWithAccess = getUsersWithAccess(screen.name);
                const screenPermissions = getScreenPermissions(screen.name);

                return (
                  <Card key={screen.name} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{screen.displayName}</h3>
                          <p className="text-sm text-gray-600">
                            {usersWithAccess.length} usuário(s) com acesso
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddPermission(screen)}
                          className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Permissão
                        </Button>
                      </div>

                      {usersWithAccess.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Usuários com Acesso:</p>
                          <div className="flex flex-wrap gap-2">
                            {usersWithAccess.map((user) => {
                              const permission = screenPermissions.find(p => p.user_id === user.id);
                              return (
                                <div
                                  key={user.id}
                                  onClick={() => handleUserClick(screen, user)}
                                  className="cursor-pointer hover:shadow-md transition-shadow"
                                >
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-2 text-sm">
                                    <Shield className="w-3 h-3 mr-1" />
                                    {user.full_name}
                                    <span className="ml-2 text-xs">
                                      ({permission?.can_view ? 'V' : ''}{permission?.can_edit ? 'E' : ''}{permission?.can_delete ? 'X' : ''})
                                    </span>
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            V = Visualizar | E = Editar | X = Excluir
                          </p>
                          <p className="text-xs text-gray-500">
                            Clique em um usuário para editar ou remover permissões
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {showPermissionDialog && (
          <PermissionDialog
            screen={selectedScreen}
            permission={selectedPermission}
            users={getUsersWithoutAccess(selectedScreen?.name)}
            onClose={() => {
              setShowPermissionDialog(false);
              setSelectedScreen(null);
              setSelectedPermission(null);
            }}
          />
        )}
      </div>
    </div>
  );
}