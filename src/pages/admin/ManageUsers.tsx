import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  User,
  Mail,
  MoreHorizontal,
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  Star,
  Search,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/useAuthStore'
import { Link } from 'react-router-dom'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Key } from 'lucide-react'

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')

  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [minScoreFilter, setMinScoreFilter] = useState('')

  const { toast } = useToast()
  const { t } = useLanguageStore()

  const { user: currentUser } = useAuthStore()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_users_with_metrics')

    if (!error && data) {
      setUsers(data || [])
    } else {
      console.error('Error fetching users:', error)
      const { data: fallbackData } = await supabase
        .from('profiles')
        .select(
          'id, name, email, role, is_admin, created_at, country, city, state, status',
        )
        .order('created_at', { ascending: false })

      setUsers(fallbackData || [])
    }
    setLoading(false)
  }

  const handleEdit = (u: any) => {
    setSelectedUser(u)
    setNewName(u.name || '')
    setNewRole(u.role || 'contractor')
    setEditOpen(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    const isAdmin = newRole === 'admin'
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName, role: newRole, is_admin: isAdmin })
      .eq('id', selectedUser.id)

    if (error) {
      toast({
        title: 'Error updating user',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'User updated successfully' })
      setEditOpen(false)
      fetchUsers()
    }
  }

  const handleToggleSuspend = async (u: any) => {
    const newStatus = u.status === 'suspended' ? 'active' : 'suspended'
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', u.id)

    if (error) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`,
      })
      fetchUsers()
    }
  }

  const handleDelete = async (u: any) => {
    if (
      !confirm(
        `Are you sure you want to delete ${u.name || u.email}? This action cannot be undone.`,
      )
    )
      return

    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: u.id,
    })

    if (error) {
      toast({
        title: 'Error deleting user',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'User deleted successfully' })
      fetchUsers()
    }
  }

  const handleSendReset = async (u: any) => {
    const { error } = await supabase.auth.resetPasswordForEmail(u.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast({
        title: t('auth.reset.admin_error') || 'Failed to send reset email',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: (
          t('auth.reset.admin_success') ||
          'Password reset email sent to {email}.'
        ).replace('{email}', u.email),
      })
    }
  }

  const clearFilters = () => {
    setSearch('')
    setLocationFilter('')
    setStatusFilter('all')
    setMinScoreFilter('')
  }

  const filteredUsers = users.filter((u) => {
    try {
      const searchLower = search.toLowerCase().trim()
      const matchesSearch =
        !searchLower ||
        String(u.name || '')
          .toLowerCase()
          .includes(searchLower) ||
        String(u.email || '')
          .toLowerCase()
          .includes(searchLower)

      const locLower = locationFilter.toLowerCase().trim()
      const matchesLoc =
        !locLower ||
        String(u.city || '')
          .toLowerCase()
          .includes(locLower) ||
        String(u.state || '')
          .toLowerCase()
          .includes(locLower) ||
        String(u.country || '')
          .toLowerCase()
          .includes(locLower)

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter

      const rating =
        u.rating !== undefined && u.rating !== null ? Number(u.rating) : 5.0
      const minScore = minScoreFilter ? Number(minScoreFilter) : 0
      const matchesScore = !minScoreFilter || rating >= minScore

      return matchesSearch && matchesLoc && matchesStatus && matchesScore
    } catch (e) {
      console.error('Filter error on user:', u, e)
      return true
    }
  })

  const canSetAdmin = currentUser?.isPremium

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">
          Monitor user performance and administer platform roles and status.
        </p>
      </div>

      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl shadow-sm border border-border/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background/50 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="whitespace-nowrap text-sm text-muted-foreground">
              Min Score:
            </Label>
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="e.g. 4.5"
              className="w-full sm:w-[100px] bg-background/50 border-border/50"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            placeholder="Filter by City, State, or Country..."
            className="w-full sm:w-[300px] bg-background/50 border-border/50"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <Button
            variant="ghost"
            className="w-full sm:w-auto text-muted-foreground ml-auto"
            onClick={clearFilters}
          >
            <X className="w-4 h-4 mr-2" /> Clear Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Jobs Executed</TableHead>
              <TableHead>Status / Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="mt-0.5 self-start">
                      {u.is_admin ? (
                        <Shield className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <Link
                        to={`/profile/${u.id}`}
                        className="hover:underline hover:text-primary transition-colors text-base font-semibold"
                      >
                        {u.name || 'Unnamed'}
                      </Link>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {[u.city, u.state, u.country].filter(Boolean).join(', ') ||
                      'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {u.rating ? Number(u.rating).toFixed(1) : '5.0'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {u.jobs_executed || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 items-start">
                    <Badge
                      variant={u.is_admin ? 'default' : 'secondary'}
                      className="capitalize text-xs"
                    >
                      {u.role || 'contractor'}
                    </Badge>
                    {u.status === 'suspended' && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Suspended
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(u)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleSuspend(u)}>
                        {u.status === 'suspended' ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-green-500">Activate</span>
                          </>
                        ) : (
                          <>
                            <Ban className="mr-2 h-4 w-4 text-orange-500" />
                            <span className="text-orange-500">Suspend</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendReset(u)}>
                        <Key className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="text-blue-500">
                          {t('auth.reset.admin_trigger') || 'Send Reset Email'}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(u)}>
                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                        <span className="text-red-500">Delete Account</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="User name"
              />
            </div>
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="executor">Executor</SelectItem>
                  {canSetAdmin && (
                    <SelectItem value="admin">Administrator</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {newRole === 'admin' && (
              <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                Warning: Assigning Administrator role grants full system access.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
