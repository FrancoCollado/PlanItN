import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne
} from '@mikro-orm/decorators/legacy';

import { Categoria } from './categoria.js';
import { User } from './usuario.js';

@Entity({ tableName: 'servicios' })
export class Servicio {

  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Categoria, {
    fieldName: 'categoria_id',
    deleteRule: 'cascade'
  })
  categoria!: Categoria;

  @ManyToOne(() => User, {
    fieldName: 'usuario_id',
    deleteRule: 'cascade'
  })
  usuario!: User;

  @Property({ type: 'string', length: 100 })
  nombre!: string;

  @Property({
    type: 'string',
    columnType: 'text',
    nullable: true
  })
  descripcion?: string;

  @Property({
    type: 'string',
    length: 255,
    nullable: true
  })
  imagen?: string;

  @Property({
    type: 'Date',
    fieldName: 'creado_en'
  })
  creadoEn!: Date;

  // Indica si el servicio ya está publicado (activo) o si es un borrador
  @Property({
    type: 'boolean',
    default: true
  })
  draft: boolean = true;
}