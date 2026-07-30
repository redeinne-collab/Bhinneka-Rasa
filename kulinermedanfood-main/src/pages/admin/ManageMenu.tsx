import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Search, ChefHat, Star } from 'lucide-react'
import { adminFetch } from '../../services/adminApi'

import API_BASE_URL from '../../config/api'

interface Dish {
  id: number
  name: string
  description: string
  category: string
  price: number
  image: string
  is_popular: number
  history: string
  ingredients: string
  nutrition: string
  created_at: string
}

interface FormData {
  name: string
  description: string
  category: string
  price: number
  image: string
  is_popular: boolean
  history: string
  ingredients: string
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  category: '',
  price: 0,
  image: '',
  is_popular: false,
  history: '',
  ingredients: '',
}

export default function ManageMenu() {
  const navigate = useNavigate()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  useEffect(() => { fetchDishes() }, [])

  const fetchDishes = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/dishes`)
      const data = await res.json()
      if (data.success) setDishes(data.data)
    } catch (error) {
      console.error('Error fetching dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingDish
        ? `${API_BASE_URL}/admin/dishes/${editingDish.id}`
        : `${API_BASE_URL}/admin/dishes`
      const method = editingDish ? 'PUT' : 'POST'

      const res = await adminFetch(url, { method, body: JSON.stringify(formData) })
      const data = await res.json()
      if (data.success) {
        alert(editingDish ? 'Menu berhasil diupdate!' : 'Menu berhasil ditambahkan!')
        fetchDishes()
        setShowForm(false)
        setEditingDish(null)
        setFormData(EMPTY_FORM)
      } else {
        alert(data.message || 'Gagal menyimpan')
      }
    } catch {
      alert('Terjadi kesalahan!')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/dishes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { alert('Menu berhasil dihapus!'); fetchDishes() }
    } catch {
      alert('Gagal menghapus menu!')
    }
  }

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish)
    setFormData({
      name: dish.name,
      description: dish.description || '',
      category: dish.category || '',
      price: dish.price || 0,
      image: dish.image || '',
      is_popular: dish.is_popular === 1,
      history: dish.history || '',
      ingredients: typeof dish.ingredients === 'string' ? dish.ingredients : '',
    })
    setShowForm(true)
  }

  const openAddForm = () => {
    setEditingDish(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  const filteredDishes = dishes.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Kelola Menu</h1>
                <p className="text-sm text-gray-500">{dishes.length} menu items</p>
              </div>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              <Plus className="w-4 h-4" /> Tambah Menu
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingDish ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Menu *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Kategori & Harga */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="cth: Soup, Dessert..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* URL Gambar */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">URL Gambar</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="preview"
                      className="mt-2 h-24 w-full object-cover rounded-xl border border-gray-200"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                </div>

                {/* Populer */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="is_popular" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Menu Populer
                  </label>
                </div>

                {/* History */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sejarah</label>
                  <textarea
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" /> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gambar</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Harga</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-600">{dish.id}</td>
                    <td className="px-4 py-3">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const sibling = e.currentTarget.nextElementSibling as HTMLElement | null
                            if (sibling) sibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div
                        className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center text-gray-400 text-xs"
                        style={{ display: dish.image ? 'none' : 'flex' }}
                      >
                        No img
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{dish.name}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{dish.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {dish.category || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-600">
                      Rp {(dish.price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      {dish.is_popular === 1 && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1 w-fit">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Populer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(dish)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDishes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Tidak ada menu yang ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
