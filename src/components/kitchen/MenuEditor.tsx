import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
    <div className="p-4">
      {/* Categories */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">{t.menuEditor}</h2>
        <Button size="sm" onClick={() => openCatDialog()}>
          <Plus className="!size-4" />
          {t.addCategory}
        </Button>
      </div>

      {sortedCategories.map((cat) => {
        const catItems = items
          .filter((i) => i.categoryId === cat.id)
          .sort((a, b) => a.order - b.order)
        const catDisplayName = localized(language, cat.name, cat.nameEn)

        return (
          <Card key={cat.id} className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base">{catDisplayName}</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openCatDialog(cat)}
                >
                  <Pencil className="!size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[hsl(var(--destructive))]"
                  onClick={() => {
                    if (confirm(t.confirmDeleteCategory)) {
                      deleteCategory(cat.id)
                    }
                  }}
                >
                  <Trash2 className="!size-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2">
                {catItems.map((item) => {
                  const displayName = localized(language, item.name, item.nameEn)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-2"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{displayName}</span>
                        <span className="ml-2 text-sm text-[hsl(var(--primary))]">
                          ${item.price}
                        </span>
                        {item.options.length > 0 && (
                          <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                            ({item.options.length} {t.options})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openItemDialog(cat.id, item)}
                      >
                        <Pencil className="!size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[hsl(var(--destructive))]"
                        onClick={() => {
                          if (confirm(t.confirmDeleteItem)) {
                            deleteItem(item.id)
                          }
                        }}
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
                className="mt-3 w-full"
                onClick={() => openItemDialog(cat.id)}
              >
                <Plus className="!size-4" />
                {t.addItem}
              </Button>
            </CardContent>
          </Card>
        )
      })}

      {/* Category Dialog */}
      <Dialog
        open={catDialog.open}
        onOpenChange={(open) => !open && setCatDialog({ open: false })}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {catDialog.editing ? t.editCategory : t.addCategory}
            </DialogTitle>
            <DialogDescription>{t.categoryName}</DialogDescription>
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

      {/* Item Dialog */}
      <Dialog
        open={itemDialog.open}
        onOpenChange={(open) => !open && setItemDialog({ open: false })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {itemDialog.editing ? t.editItem : t.addItem}
            </DialogTitle>
            <DialogDescription>{t.itemName}</DialogDescription>
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
              className="flex h-12 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2"
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
            <div className="border-t border-[hsl(var(--border))] pt-3">
              <h4 className="mb-2 font-medium">{t.options}</h4>
              {itemOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="mb-2 flex items-center gap-2 text-sm"
                >
                  <span className="flex-1">
                    {opt.name} (+${opt.price})
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-[hsl(var(--destructive))]"
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
