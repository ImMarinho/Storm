
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, FileText, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import NegotiationForm from "../components/negotiations/NegotiationForm";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Negociacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: negotiations = [], isLoading } = useQuery({
    queryKey: ['negotiations'],
    queryFn: () => base44.entities.NegotiationType.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NegotiationType.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });

  const filteredNegotiations = negotiations.filter(neg =>
    neg.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    neg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (negotiation) => {
    setSelectedNegotiation(negotiation);
    setShowForm(true);
  };

  const handleDelete = async (negotiation) => {
    if (confirm(`Tem certeza que deseja excluir ${negotiation.description}?`)) {
      deleteMutation.mutate(negotiation.id);
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Tipos de Negociação</h1>
              <p className="text-gray-600 mt-1">Gerencie os tipos de negociação</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedNegotiation(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Tipo
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Lista de Tipos</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tipo..."
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
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full mb-3" />
                ))}
              </div>
            ) : filteredNegotiations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nenhum tipo de negociação encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNegotiations.map((negotiation) => (
                      <TableRow key={negotiation.id}>
                        <TableCell className="font-medium">{negotiation.code}</TableCell>
                        <TableCell>{negotiation.description}</TableCell>
                        <TableCell className="text-gray-600">
                          {negotiation.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(negotiation)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(negotiation)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {showForm && (
          <NegotiationForm
            negotiation={selectedNegotiation}
            onClose={() => {
              setShowForm(false);
              setSelectedNegotiation(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
