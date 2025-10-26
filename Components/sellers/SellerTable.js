import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerTable({ sellers, isLoading, currentUser, onEdit, onDelete, canEditSeller }) {
  if (isLoading) {
    return (
      <div className="p-6">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-3" />
        ))}
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p>Nenhum vendedor encontrado</p>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const styles = {
      SUP: "bg-purple-100 text-purple-800 border-purple-200",
      ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
      VENDEDOR: "bg-green-100 text-green-800 border-green-200",
    };
    return (
      <Badge className={`${styles[role]} border`}>
        {role === 'SUP' && <Shield className="w-3 h-3 mr-1" />}
        {role}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map((seller) => (
            <TableRow key={seller.id}>
              <TableCell className="font-medium">{seller.full_name}</TableCell>
              <TableCell>{seller.email}</TableCell>
              <TableCell>{seller.phone || '-'}</TableCell>
              <TableCell>{getRoleBadge(seller.role)}</TableCell>
              <TableCell>
                {seller.active !== false ? (
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Inativo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {canEditSeller(seller) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(seller)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {seller.role !== 'SUP' && (currentUser?.role === 'SUP' || currentUser?.role === 'ADMIN') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(seller)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}