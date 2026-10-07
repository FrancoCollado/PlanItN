var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
let Evento = class Evento {
    id;
    nombre;
    descripcion;
    creadoEn;
    imagen;
    // Indica si el evento todavía es un borrador (no visible/publicado) o ya está confirmado
    draft = true;
};
__decorate([
    PrimaryKey({ type: 'number' }),
    __metadata("design:type", Number)
], Evento.prototype, "id", void 0);
__decorate([
    Property({ type: 'string', length: 100 }),
    __metadata("design:type", String)
], Evento.prototype, "nombre", void 0);
__decorate([
    Property({ type: 'string', columnType: 'text', nullable: true }),
    __metadata("design:type", String)
], Evento.prototype, "descripcion", void 0);
__decorate([
    Property({
        type: 'Date',
        fieldName: 'creado_en',
        nullable: true
    }),
    __metadata("design:type", Date)
], Evento.prototype, "creadoEn", void 0);
__decorate([
    Property({ type: 'string', length: 255, nullable: true }),
    __metadata("design:type", String)
], Evento.prototype, "imagen", void 0);
__decorate([
    Property({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Evento.prototype, "draft", void 0);
Evento = __decorate([
    Entity({ tableName: 'eventos' })
], Evento);
export { Evento };
