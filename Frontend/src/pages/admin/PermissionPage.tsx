import { useState, useEffect } from "react"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { 
  Search,
  Plus,
  Trash2,
  Loader2,
  Shield,
  Save,
  X,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Checkbox } from "../../components/ui/checkbox"
import { toast } from "sonner"
import { PermissionService, type Permission, type Module, type RolePermission } from "../../features/auth/services/permission.service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

const ROLES = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Doctor" },
  { id: 3, name: "Patient" },
  { id: 4, name: "Receptionist" },
]

export default function PermissionPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])

  const [selectedRoleId, setSelectedRoleId] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  
  const [newPermission, setNewPermission] = useState({
    name: "",
    module: "",
    action: "",
    description: "",
  })
  
  
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId)
    }
  }, [selectedRoleId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [modulesRes, permissionsRes] = await Promise.all([
        PermissionService.getModules(),
        PermissionService.getPermissions(),
      ])
      setModules(Array.isArray(modulesRes) ? modulesRes : [])
      setPermissions(Array.isArray(permissionsRes) ? permissionsRes : [])
    } catch (error: any) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.message || "Không thể tải dữ liệu permissions")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const data = await PermissionService.getRolePermissions(roleId)
      
      setSelectedPermissionIds(data.permissions.map(p => p.id))
    } catch (error: any) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.message || "Không thể tải permissions của role")
      }
    }
  }

  const handleCreatePermission = async () => {
    if (!newPermission.name || !newPermission.module || !newPermission.action) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      await PermissionService.createPermission(newPermission)
      toast.success("Tạo permission thành công!")
      setIsCreateDialogOpen(false)
      setNewPermission({ name: "", module: "", action: "", description: "" })
      fetchData()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tạo permission")
      }
    }
  }

  const handleDeletePermission = async (id: number) => {
    try {
      setIsDeleting(id)
      await PermissionService.deletePermission(id)
      toast.success("Xóa permission thành công!")
      fetchData()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xóa permission")
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSaveRolePermissions = async () => {
    try {
      setIsSaving(true)
      await PermissionService.assignPermissionsToRole(selectedRoleId, {
        permissionIds: selectedPermissionIds,
      })
      toast.success("Cập nhật permissions cho role thành công!")
      fetchRolePermissions(selectedRoleId)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật permissions")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const togglePermission = (permissionId: number) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const filteredPermissions = permissions.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.action.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải permissions...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản lý Permissions</h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm permissions..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Permission
            </Button>
          </div>
        </div>

        <Tabs defaultValue="permissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="permissions">Danh sách Permissions</TabsTrigger>
            <TabsTrigger value="role-permissions">Phân quyền theo Role</TabsTrigger>
          </TabsList>

          {}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Tất cả Permissions ({filteredPermissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{permission.name}</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {permission.module}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {permission.action}
                          </Badge>
                        </div>
                        {permission.description && (
                          <p className="text-sm text-gray-500">{permission.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDeletePermission(permission.id)}
                        disabled={isDeleting === permission.id}
                      >
                        {isDeleting === permission.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="role-permissions">
            <Card>
              <CardHeader>
                <CardTitle>Phân quyền theo Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Chọn Role</Label>
                  <Select value={selectedRoleId.toString()} onValueChange={(value) => setSelectedRoleId(parseInt(value))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {modules.length > 0 && (
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">{module.name}</h3>
                        <div className="space-y-2">
                          {(module.permissions || []).map((permission) => (
                            <div key={permission.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedPermissionIds.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <Label className="flex-1 cursor-pointer">
                                {permission.name}
                                {permission.description && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    - {permission.description}
                                  </span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveRolePermissions} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu Permissions
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Permission mới</DialogTitle>
              <DialogDescription>
                Tạo một permission mới cho hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Tên Permission *</Label>
                <Input
                  id="name"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  placeholder="Ví dụ: users.create"
                />
              </div>
              <div>
                <Label htmlFor="module">Module *</Label>
                <Input
                  id="module"
                  value={newPermission.module}
                  onChange={(e) => setNewPermission({ ...newPermission, module: e.target.value })}
                  placeholder="Ví dụ: users"
                />
              </div>
              <div>
                <Label htmlFor="action">Action *</Label>
                <Input
                  id="action"
                  value={newPermission.action}
                  onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
                  placeholder="Ví dụ: create"
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  placeholder="Mô tả về permission"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button onClick={handleCreatePermission}>
                <Save className="h-4 w-4 mr-2" />
                Tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}
