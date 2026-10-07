var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/decorators/legacy';
import { Categoria } from './categoria.js';
import { User } from './usuario.js';
let Servicio = class Servicio {
    id;
    categoria;
    usuario;
    nombre;
    descripcion;
    imagen;
    creadoEn;
    // Indica si el servicio ya está publicado (activo) o si es un borrador
    draft = true;
};
__decorate([
    PrimaryKey({ type: 'number' }),
    __metadata("design:type", Number)
], Servicio.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Categoria, {
        fieldName: 'categoria_id',
        deleteRule: 'cascade'
    }),
    __metadata("design:type", Categoria)
], Servicio.prototype, "categoria", void 0);
__decorate([
    ManyToOne(() => User, {
        fieldName: 'usuario_id',
        deleteRule: 'cascade'
    }),
    __metadata("design:type", User)
], Servicio.prototype, "usuario", void 0);
__decorate([
    Property({ type: 'string', length: 100 }),
    __metadata("design:type", String)
], Servicio.prototype, "nombre", void 0);
__decorate([
    Property({
        type: 'string',
        columnType: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Servicio.prototype, "descripcion", void 0);
__decorate([
    Property({
        type: 'string',
        length: 255,
        nullable: true
    }),
    __metadata("design:type", String)
], Servicio.prototype, "imagen", void 0);
__decorate([
    Property({
        type: 'Date',
        fieldName: 'creado_en'
    }),
    __metadata("design:type", Date)
], Servicio.prototype, "creadoEn", void 0);
__decorate([
    Property({
        type: 'boolean',
        default: true
    }),
    __metadata("design:type", Boolean)
], Servicio.prototype, "draft", void 0);
Servicio = __decorate([
    Entity({ tableName: 'servicios' })
], Servicio);
export { Servicio };
