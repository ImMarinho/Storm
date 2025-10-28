import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, UserCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientTable({ clients, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="p-6">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-3" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <UserCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Nome</TableHead>
            <TableHead>CPF/CNPJ</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.document}</TableCell>
              <TableCell>{client.phone || '-'}</TableCell>
              <TableCell>{client.email || '-'}</TableCell>
              <TableCell>
                {client.active !== false ? (
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Inativo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(client)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(client)}
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
  );
}