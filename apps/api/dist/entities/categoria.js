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
import { Evento } from './evento.js';
let Categoria = class Categoria {
    id;
    evento;
    nombre;
    descripcion;
    creadoEn;
};
__decorate([
    PrimaryKey({ type: 'number' }),
    __metadata("design:type", Number)
], Categoria.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Evento, {
        fieldName: 'evento_id',
        deleteRule: 'cascade'
    }),
    __metadata("design:type", Evento)
], Categoria.prototype, "evento", void 0);
__decorate([
    Property({ type: 'string', length: 100 }),
    __metadata("design:type", String)
], Categoria.prototype, "nombre", void 0);
__decorate([
    Property({ type: 'string', columnType: 'text', nullable: true }),
    __metadata("design:type", String)
], Categoria.prototype, "descripcion", void 0);
__decorate([
    Property({
        type: 'Date',
        fieldName: 'creado_en'
    }),
    __metadata("design:type", Date)
], Categoria.prototype, "creadoEn", void 0);
Categoria = __decorate([
    Entity({ tableName: 'categorias' })
], Categoria);
export { Categoria };
