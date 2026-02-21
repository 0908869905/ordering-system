import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useMenuStore } from '@/stores/useMenuStore'
import { generateId, localized } from '@/lib/utils'
import type { Category, MenuItem, MenuOption, Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  language: Language
}

export default function MenuEditor({ t, language }: Props) {
  const {
    categories,
    items,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
  } = useMenuStore()

  const [catDialog, setCatDialog] = useState<{
    open: boolean
    editing?: Category
  }>({ open: false })
  const [itemDialog, setItemDialog] = useState<{
    open: boolean
    editing?: MenuItem
    categoryId?: string
  }>({ open: false })

  // Category form
  const [catName, setCatName] = useState('')
  const [catNameEn, setCatNameEn] = useState('')

  // Item form
  const [itemName, setItemName] = useState('')
  const [itemNameEn, setItemNameEn] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemCategoryId, setItemCategoryId] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemOptions, setItemOptions] = useState<MenuOption[]>([])
  const [newOptName, setNewOptName] = useState('')
  const [newOptNameEn, setNewOptNameEn] = useState('')
  const [newOptPrice, setNewOptPrice] = useState('')

  const [pendingDelete, setPendingDelete] = useState<{ message: string; action: () => void } | null>(null)

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  const openCatDialog = (cat?: Category) => {
    if (cat) {
      setCatName(cat.name)
      setCatNameEn(cat.nameEn ?? '')
      setCatDialog({ open: true, editing: cat })
    } else {
      setCatName('')
      setCatNameEn('')
      setCatDialog({ open: true })
    }
  }

  const saveCat = () => {
    if (!catName.trim()) return
    if (catDialog.editing) {
      updateCategory(catDialog.editing.id, {
        name: catName.trim(),
        nameEn: catNameEn.trim() || undefined,
      })
    } else {
      addCategory({
        name: catName.trim(),
        nameEn: catNameEn.trim() || undefined,
      })
    }
    setCatDialog({ open: false })
  }

  const openItemDialog = (categoryId: string, item?: MenuItem) => {
    if (item) {
      setItemName(item.name)
      setItemNameEn(item.nameEn ?? '')
      setItemPrice(item.price.toString())
      setItemCategoryId(item.categoryId)
      setItemDesc(item.description ?? '')
      setItemOptions([...item.options])
      setItemDialog({ open: true, editing: item, categoryId })
    } else {
      setItemName('')
      setItemNameEn('')
      setItemPrice('')
      setItemCategoryId(categoryId)
      setItemDesc('')
      setItemOptions([])
      setItemDialog({ open: true, categoryId })
    }
  }

  const addOption = () => {
    if (!newOptName.trim() || !newOptPrice.trim()) return
    setItemOptions((prev) => [
      ...prev,
      {
        id: generateId('opt'),
        name: newOptName.trim(),
        nameEn: newOptNameEn.trim() || undefined,
        price: parseInt(newOptPrice) || 0,
      },
    ])
    setNewOptName('')
    setNewOptNameEn('')
    setNewOptPrice('')
  }

  const removeOption = (id: string) => {
    setItemOptions((prev) => prev.filter((o) => o.id !== id))
  }

  const saveItem = () => {
    if (!itemName.trim() || !itemPrice.trim() || !itemCategoryId) return
    const data = {
      name: itemName.trim(),
      nameEn: itemNameEn.trim() || undefined,
      price: parseInt(itemPrice) || 0,
      categoryId: itemCategoryId,
      description: itemDesc.trim() || undefined,
      options: itemOptions,
    }
    if (itemDialog.editing) {
      updateItem(itemDialog.editing.id, data)
    } else {
      addItem({ ...data, available: true, stock: -1 })
    }
    setItemDialog({ open: false })
  }

  return (
    <div className="p-4 animate-fade-in">
      {/* Categories */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold ink-text">{t.menuEditor}</h2>
        <Button size="sm" onClick={() => openCatDialog()}>
          <Plus className="!size-4" />
          {t.addCategory}
        </Button>
      </div>

      {sortedCategories.map((cat, catIdx) => {
        const catItems = items
          .filter((i) => i.categoryId === cat.id)
          .sort((a, b) => a.order - b.order)
        const catDisplayName = localized(language, cat.name, cat.nameEn)

        return (
          <div key={cat.id} className={`mb-5 ${catIdx % 2 === 0 ? 'organic-radius' : 'organic-radius-alt'} border border-warm-800/30 bg-[#2e2a22] overflow-hidden`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-dashed border-warm-700/30">
              <h3 className="font-heading font-semibold text-primary-400">{catDisplayName}</h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-warm-400 hover:text-primary-400"
                  onClick={() => openCatDialog(cat)}
                >
                  <Pencil className="!size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-warm-400 hover:text-accent-400"
                  onClick={() => setPendingDelete({ message: t.confirmDeleteCategory, action: () => deleteCategory(cat.id) })}
                >
                  <Trash2 className="!size-3.5" />
                </Button>
              </div>
            </div>
            <div className="p-3">
              <div className="flex flex-col gap-2">
                {catItems.map((item) => {
                  const displayName = localized(language, item.name, item.nameEn)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 organic-radius border border-warm-700/20 bg-warm-900/30 p-2.5 transition-colors hover:bg-warm-800/30"
                    >
                      <div className="flex-1">
                        <span className="font-heading font-medium">{displayName}</span>
                        <span className="ml-2 text-sm text-primary-400 font-mono">
                          ${item.price}
                        </span>
                        {item.options.length > 0 && (
                          <span className="ml-2 text-xs text-warm-500">
                            ({item.options.length} {t.options})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-warm-400 hover:text-primary-400"
                        onClick={() => openItemDialog(cat.id, item)}
                      >
                        <Pencil className="!size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-warm-400 hover:text-accent-400"
                        onClick={() => setPendingDelete({ message: t.confirmDeleteItem, action: () => deleteItem(item.id) })}
                      >
                        <Trash2 className="!size-3.5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full border-dashed border-warm-600/30 text-warm-400 hover:text-primary-400 hover:border-primary-500/30"
                onClick={() => openItemDialog(cat.id)}
              >
                <Plus className="!size-4" />
                {t.addItem}
              </Button>
            </div>
          </div>
        )
      })}

      {/* Category Dialog */}
      <Dialog
        open={catDialog.open}
        onOpenChange={(open) => !open && setCatDialog({ open: false })}
      >
        <DialogContent className="max-w-sm dark bg-[#2e2a22] border-warm-700/30 text-warm-100">
          <DialogHeader>
            <DialogTitle className="text-primary-400">
              {catDialog.editing ? t.editCategory : t.addCategory}
            </DialogTitle>
            <DialogDescription className="text-warm-500">{t.categoryName}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder={t.categoryName}
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              autoFocus
            />
            <Input
              placeholder={t.categoryNameEn}
              value={catNameEn}
              onChange={(e) => setCatNameEn(e.target.value)}
            />
            <Button onClick={saveCat}>{t.save}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        message={pendingDelete?.message ?? ''}
        confirmLabel={t.confirm}
        cancelLabel={t.back}
        onConfirm={() => { pendingDelete?.action(); setPendingDelete(null) }}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Item Dialog */}
      <Dialog
        open={itemDialog.open}
        onOpenChange={(open) => !open && setItemDialog({ open: false })}
      >
        <DialogContent className="max-w-md dark bg-[#2e2a22] border-warm-700/30 text-warm-100">
          <DialogHeader>
            <DialogTitle className="text-primary-400">
              {itemDialog.editing ? t.editItem : t.addItem}
            </DialogTitle>
            <DialogDescription className="text-warm-500">{t.itemName}</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            <Input
              placeholder={t.itemName}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              autoFocus
            />
            <Input
              placeholder={t.itemNameEn}
              value={itemNameEn}
              onChange={(e) => setItemNameEn(e.target.value)}
            />
            <Input
              type="number"
              placeholder={t.price}
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              min={0}
            />
            <select
              className="flex h-12 w-full organic-radius border border-warm-700/30 bg-warm-900/50 px-3 py-2 font-heading text-warm-200"
              value={itemCategoryId}
              onChange={(e) => setItemCategoryId(e.target.value)}
            >
              {sortedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input
              placeholder={t.description}
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
            />

            {/* Options */}
            <div className="border-t border-dashed border-warm-700/30 pt-3">
              <h4 className="mb-2 font-heading font-medium text-warm-300">{t.options}</h4>
              {itemOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="mb-2 flex items-center gap-2 text-sm"
                >
                  <span className="flex-1 font-heading text-warm-200">
                    {opt.name} <span className="text-primary-400 font-mono">(+${opt.price})</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-warm-400 hover:text-accent-400"
                    onClick={() => removeOption(opt.id)}
                  >
                    <Trash2 className="!size-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder={t.optionName}
                  value={newOptName}
                  onChange={(e) => setNewOptName(e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  type="number"
                  placeholder={t.optionPrice}
                  value={newOptPrice}
                  onChange={(e) => setNewOptPrice(e.target.value)}
                  className="h-9 w-20 text-sm"
                  min={0}
                />
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="!size-3" />
                </Button>
              </div>
            </div>

            <Button onClick={saveItem}>{t.save}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
