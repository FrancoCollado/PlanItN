var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, ManyToOne } from '@mikro-orm/decorators/legacy';
import { Evento } from './evento.js';
import { Categoria } from './categoria.js';
let EventoCategoria = class EventoCategoria {
    // Clave primaria compuesta: evento_id + categoria_id, ambas también son FK
    evento;
    categoria;
};
__decorate([
    ManyToOne(() => Evento, {
        primary: true,
        fieldName: 'evento_id',
        deleteRule: 'cascade'
    }),
    __metadata("design:type", Evento)
], EventoCategoria.prototype, "evento", void 0);
__decorate([
    ManyToOne(() => Categoria, {
        primary: true,
        fieldName: 'categoria_id',
        deleteRule: 'cascade'
    }),
    __metadata("design:type", Categoria)
], EventoCategoria.prototype, "categoria", void 0);
EventoCategoria = __decorate([
    Entity({ tableName: 'evento_categoria' })
], EventoCategoria);
export { EventoCategoria };
