import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function PermissionDialog({ screen, permission, users, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    user_id: permission?.user_id || "",
    can_view: permission?.can_view !== false,
    can_edit: permission?.can_edit || false,
    can_delete: permission?.can_delete || false,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const selectedUser = users.find(u => u.id === data.user_id) || 
        (await base44.entities.User.list()).find(u => u.id === data.user_id);
      
      const permissionData = {
        user_id: data.user_id,
        user_name: selectedUser?.full_name || "",
        screen_name: screen.name,
        can_view: data.can_view,
        can_edit: data.can_edit,
        can_delete: data.can_delete,
      };

      if (permission) {
        return base44.entities.ScreenPermission.update(permission.id, permissionData);
      }
      return base44.entities.ScreenPermission.create(permissionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {permission ? 'Editar Permissão' : 'Adicionar Permissão'}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Tela: {screen.displayName}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">Usuário *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                disabled={!!permission}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {permission && (
                <p className="text-xs text-gray-500">O usuário não pode ser alterado</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Permissões</Label>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="can_view"
                  checked={formData.can_view}
                  onCheckedChange={(checked) => setFormData({ ...formData, can_view: checked })}
                />
                <Label htmlFor="can_view" className="cursor-pointer font-normal">
                  Visualizar - Pode acessar e visualizar a tela
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="can_edit"
                  checked={formData.can_edit}
                  onCheckedChange={(checked) => setFormData({ ...formData, can_edit: checked })}
                />
                <Label htmlFor="can_edit" className="cursor-pointer font-normal">
                  Editar - Pode editar informações na tela
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="can_delete"
                  checked={formData.can_delete}
                  onCheckedChange={(checked) => setFormData({ ...formData, can_delete: checked })}
                />
                <Label htmlFor="can_delete" className="cursor-pointer font-normal">
                  Excluir - Pode excluir registros na tela
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={saveMutation.isPending || !formData.user_id} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}