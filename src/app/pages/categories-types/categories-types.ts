import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Button } from '../../components/ui/button/button';
import { FormField } from '../../components/ui/form-field/form-field';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { SectionCard } from '../../components/ui/section-card/section-card';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { ActiveBadge } from '../../components/ui/active-badge/active-badge';
import { ResourceCategory, ResourceType } from '../../core/models/catalog.model';
import { CatalogStore } from '../../core/services/catalog.store';

const INPUT_CLASS =
  'h-9 rounded border border-outline-variant bg-surface-container-lowest px-space-sm text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container';

/** Categorías de recursos y, dentro de la categoría seleccionada, sus tipos. */
@Component({
  selector: 'app-categories-types',
  imports: [
    ReactiveFormsModule,
    Button,
    FormField,
    PageHeader,
    SectionCard,
    StatePanel,
    TableShell,
    ActiveBadge,
  ],
  templateUrl: './categories-types.html',
})
export class CategoriesTypes {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogStore);

  readonly inputClass = INPUT_CLASS;
  readonly categories = this.catalog.categories;
  readonly types = this.catalog.types;

  readonly selectedCategoryId = signal<string | null>(null);
  readonly selectedCategory = computed(
    () => this.categories().find((category) => category.id === this.selectedCategoryId()) ?? null,
  );
  readonly categoryTypes = computed(() =>
    this.types().filter((type) => type.categoryId === this.selectedCategoryId()),
  );

  /** Registro en edición. `null` significa que el formulario crea uno nuevo. */
  readonly editingCategory = signal<ResourceCategory | null>(null);
  readonly editingType = signal<ResourceType | null>(null);

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(200)]],
  });

  readonly typeForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(200)]],
  });

  typesOf(categoryId: string): ResourceType[] {
    return this.types().filter((type) => type.categoryId === categoryId);
  }

  selectCategory(category: ResourceCategory): void {
    this.selectedCategoryId.set(category.id);
    this.cancelTypeEdit();
  }

  startEditCategory(category: ResourceCategory): void {
    this.editingCategory.set(category);
    this.categoryForm.setValue({ name: category.name, description: category.description });
  }

  cancelCategoryEdit(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset();
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const editing = this.editingCategory();
    const { name, description } = this.categoryForm.getRawValue();

    this.catalog.saveCategory({
      id: editing?.id ?? `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      active: editing?.active ?? true,
    });
    this.cancelCategoryEdit();
  }

  toggleCategory(category: ResourceCategory): void {
    this.catalog.saveCategory({ ...category, active: !category.active });
  }

  startEditType(type: ResourceType): void {
    this.editingType.set(type);
    this.typeForm.setValue({ name: type.name, description: type.description });
  }

  cancelTypeEdit(): void {
    this.editingType.set(null);
    this.typeForm.reset();
  }

  saveType(): void {
    const categoryId = this.selectedCategoryId();
    if (!categoryId) {
      return;
    }
    if (this.typeForm.invalid) {
      this.typeForm.markAllAsTouched();
      return;
    }

    const editing = this.editingType();
    const { name, description } = this.typeForm.getRawValue();

    this.catalog.saveType({
      id: editing?.id ?? `tipo-${Date.now()}`,
      categoryId,
      name: name.trim(),
      description: description.trim(),
      active: editing?.active ?? true,
    });
    this.cancelTypeEdit();
  }

  toggleType(type: ResourceType): void {
    this.catalog.saveType({ ...type, active: !type.active });
  }
}
