var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/decorators/legacy';
import { BigIntType } from '@mikro-orm/core';
let User = class User {
    id; //va asi por que id es non-nullable y no tiene valor por defecto, uso ! para indicar que siempre tendrá un valor.
    nombre;
    email;
    // hidden excluye el hash de toJSON: ninguna respuesta de la API lo expone.
    password;
    rol = 'cliente';
    zona;
    // Las columnas son BIGINT y pg las devuelve como string: BigIntType('number')
    // las convierte a número. Un CUIT (11 dígitos) entra holgado en un safe integer.
    cuit;
    telefono;
    // Permite suspender una cuenta sin borrarla, lo usamos para empresas
    activo = true;
    creadoEn;
};
__decorate([
    PrimaryKey({ type: 'number' }),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Property({ type: 'string', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "nombre", void 0);
__decorate([
    Property({ type: 'string', length: 100, unique: true }) //aca por ser email hago que sea unique
    ,
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Property({
        type: 'string',
        fieldName: 'contraseña',
        length: 255,
        hidden: true
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Enum({
        items: ['cliente', 'administrador', 'empresa']
    }),
    __metadata("design:type", String)
], User.prototype, "rol", void 0);
__decorate([
    Property({ type: 'string', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "zona", void 0);
__decorate([
    Property({ type: new BigIntType('number'), nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "cuit", void 0);
__decorate([
    Property({ type: new BigIntType('number'), nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "telefono", void 0);
__decorate([
    Property({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "activo", void 0);
__decorate([
    Property({
        type: 'Date',
        fieldName: 'creado_en',
        nullable: true
    }),
    __metadata("design:type", Date)
], User.prototype, "creadoEn", void 0);
User = __decorate([
    Entity({ tableName: 'usuarios' })
], User);
export { User };
