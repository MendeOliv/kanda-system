"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
var common_1 = require("@nestjs/common");
var CartService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CartService = _classThis = /** @class */ (function () {
        function CartService_1(prisma) {
            this.prisma = prisma;
        }
        CartService_1.prototype.flattenCart = function (cart) {
            return {
                items: cart.items.map(function (item) { return ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price.toNumber(),
                }); }),
                subtotal: cart.subtotal.toNumber(),
                deliveryFee: cart.deliveryFee.toNumber(),
                total: cart.total.toNumber(),
            };
        };
        CartService_1.prototype.getCart = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var cart, withItems;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.cart.findUnique({ where: { userId: userId } })];
                        case 1:
                            cart = _a.sent();
                            if (!cart) {
                                return [2 /*return*/, { items: [], subtotal: 0, deliveryFee: 0, total: 0 }];
                            }
                            return [4 /*yield*/, this.prisma.cart.findUnique({
                                    where: { id: cart.id },
                                    include: {
                                        items: {
                                            include: { product: true },
                                        },
                                    },
                                })];
                        case 2:
                            withItems = _a.sent();
                            if (!withItems) {
                                return [2 /*return*/, { items: [], subtotal: 0, deliveryFee: 0, total: 0 }];
                            }
                            return [2 /*return*/, this.flattenCart(withItems)];
                    }
                });
            });
        };
        CartService_1.prototype.getOrCreateCart = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var cart, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.cart.findUnique({ where: { userId: userId } })];
                        case 1:
                            cart = _a.sent();
                            if (!!cart) return [3 /*break*/, 8];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 8]);
                            return [4 /*yield*/, this.prisma.cart.create({
                                    data: { userId: userId, subtotal: 0, deliveryFee: 0, total: 0 },
                                })];
                        case 3:
                            cart = _a.sent();
                            return [3 /*break*/, 8];
                        case 4:
                            error_1 = _a.sent();
                            if (!(error_1.code === 'P2002')) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.cart.findUnique({ where: { userId: userId } })];
                        case 5:
                            // Another transaction created the cart, fetch it
                            cart = _a.sent();
                            if (!cart) {
                                throw error_1; // Re-throw if still not found
                            }
                            return [3 /*break*/, 7];
                        case 6: throw error_1;
                        case 7: return [3 /*break*/, 8];
                        case 8: return [2 /*return*/, cart];
                    }
                });
            });
        };
        CartService_1.prototype.addItem = function (userId, productId, quantity, externalMessageId) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, cart_1, product, cart, price, result;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!externalMessageId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.processedMessage.findUnique({
                                    where: { externalMessageId: externalMessageId },
                                })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getCart(userId)];
                        case 2:
                            cart_1 = _a.sent();
                            return [2 /*return*/, { success: true, cart: cart_1, idempotent: true }];
                        case 3: return [4 /*yield*/, this.prisma.product.findUnique({
                                where: { id: productId },
                            })];
                        case 4:
                            product = _a.sent();
                            if (!product)
                                throw new common_1.NotFoundException('Produto não encontrado');
                            if (product.status !== 'active')
                                throw new common_1.BadRequestException('Produto inativo');
                            if (quantity <= 0)
                                throw new common_1.BadRequestException('Quantidade inválida');
                            if (product.stock < quantity) {
                                throw new common_1.BadRequestException('Stock insuficiente');
                            }
                            return [4 /*yield*/, this.getOrCreateCart(userId)];
                        case 5:
                            cart = _a.sent();
                            price = product.discountPrice || product.price;
                            return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var items, subtotal, deliveryFee, total, updatedCart;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, tx.cartItem.upsert({
                                                    where: { cartId_productId: { cartId: cart.id, productId: productId } },
                                                    update: { quantity: { increment: quantity }, price: price },
                                                    create: { cartId: cart.id, productId: productId, quantity: quantity, price: price },
                                                })];
                                            case 1:
                                                _a.sent();
                                                if (!externalMessageId) return [3 /*break*/, 3];
                                                return [4 /*yield*/, tx.processedMessage.create({
                                                        data: {
                                                            externalMessageId: externalMessageId,
                                                            userId: userId,
                                                        },
                                                    })];
                                            case 2:
                                                _a.sent();
                                                _a.label = 3;
                                            case 3: return [4 /*yield*/, tx.cartItem.findMany({
                                                    where: { cartId: cart.id },
                                                    include: { product: true },
                                                })];
                                            case 4:
                                                items = _a.sent();
                                                subtotal = items.reduce(function (sum, i) { return sum + i.price.toNumber() * i.quantity; }, 0);
                                                deliveryFee = subtotal >= 10000 ? 0 : 500;
                                                total = subtotal + deliveryFee;
                                                return [4 /*yield*/, tx.cart.update({
                                                        where: { id: cart.id },
                                                        data: { subtotal: subtotal, deliveryFee: deliveryFee, total: total },
                                                        include: { items: { include: { product: true } } },
                                                    })];
                                            case 5:
                                                updatedCart = _a.sent();
                                                return [2 /*return*/, this.flattenCart(updatedCart)];
                                        }
                                    });
                                }); })];
                        case 6:
                            result = _a.sent();
                            return [2 /*return*/, { success: true, cart: result }];
                    }
                });
            });
        };
        CartService_1.prototype.recalc = function (cartId) {
            return __awaiter(this, void 0, void 0, function () {
                var items, subtotal, deliveryFee, total;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.cartItem.findMany({
                                where: { cartId: cartId },
                                include: { product: true },
                            })];
                        case 1:
                            items = _a.sent();
                            subtotal = items.reduce(function (sum, i) { return sum + i.price.toNumber() * i.quantity; }, 0);
                            deliveryFee = subtotal >= 10000 ? 0 : 500;
                            total = subtotal + deliveryFee;
                            return [2 /*return*/, this.prisma.cart.update({
                                    where: { id: cartId },
                                    data: { subtotal: subtotal, deliveryFee: deliveryFee, total: total },
                                    include: { items: { include: { product: true } } },
                                })];
                    }
                });
            });
        };
        CartService_1.prototype.updateItem = function (userId, productId, quantity, externalMessageId) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, cart_2, cart, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!externalMessageId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.processedMessage.findUnique({
                                    where: { externalMessageId: externalMessageId },
                                })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getCart(userId)];
                        case 2:
                            cart_2 = _a.sent();
                            return [2 /*return*/, { success: true, cart: cart_2, idempotent: true }];
                        case 3: return [4 /*yield*/, this.prisma.cart.findUnique({ where: { userId: userId } })];
                        case 4:
                            cart = _a.sent();
                            if (!cart) {
                                // Cart does not exist, return empty cart
                                return [2 /*return*/, { success: true, cart: { items: [], subtotal: 0, deliveryFee: 0, total: 0 } }];
                            }
                            if (!(quantity <= 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.cartItem.delete({
                                    where: { cartId_productId: { cartId: cart.id, productId: productId } },
                                })];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 6: return [4 /*yield*/, this.prisma.cartItem.update({
                                where: { cartId_productId: { cartId: cart.id, productId: productId } },
                                data: { quantity: quantity },
                            })];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8:
                            if (!externalMessageId) return [3 /*break*/, 10];
                            return [4 /*yield*/, this.prisma.processedMessage.create({
                                    data: {
                                        externalMessageId: externalMessageId,
                                        userId: userId,
                                    },
                                })];
                        case 9:
                            _a.sent();
                            _a.label = 10;
                        case 10: return [4 /*yield*/, this.getCart(userId)];
                        case 11:
                            result = _a.sent();
                            return [2 /*return*/, { success: true, cart: result }];
                    }
                });
            });
        };
        CartService_1.prototype.removeItem = function (userId, productId, externalMessageId) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, cart_3, cart, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!externalMessageId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.processedMessage.findUnique({
                                    where: { externalMessageId: externalMessageId },
                                })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getCart(userId)];
                        case 2:
                            cart_3 = _a.sent();
                            return [2 /*return*/, { success: true, cart: cart_3, idempotent: true }];
                        case 3: return [4 /*yield*/, this.prisma.cart.findUnique({ where: { userId: userId } })];
                        case 4:
                            cart = _a.sent();
                            if (!cart) {
                                // Cart does not exist, return empty cart
                                return [2 /*return*/, { success: true, cart: { items: [], subtotal: 0, deliveryFee: 0, total: 0 } }];
                            }
                            return [4 /*yield*/, this.prisma.cartItem.delete({
                                    where: { cartId_productId: { cartId: cart.id, productId: productId } },
                                }).catch(function () {
                                    // Item não existia — ignorar
                                })];
                        case 5:
                            _a.sent();
                            if (!externalMessageId) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.processedMessage.create({
                                    data: {
                                        externalMessageId: externalMessageId,
                                        userId: userId,
                                    },
                                })];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7: return [4 /*yield*/, this.getCart(userId)];
                        case 8:
                            result = _a.sent();
                            return [2 /*return*/, { success: true, cart: result }];
                    }
                });
            });
        };
        CartService_1.prototype.clearCart = function (userId, externalMessageId) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, cart;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!externalMessageId) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.prisma.processedMessage.findUnique({
                                    where: { externalMessageId: externalMessageId },
                                })];
                        case 1:
                            existing = _a.sent();
                            if (existing) {
                                // Return success without processing
                                return [2 /*return*/, { success: true, idempotent: true }];
                            }
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.prisma.cart.findUnique({ where: { userId: userId } })];
                        case 3:
                            cart = _a.sent();
                            if (!cart) {
                                // Cart does not exist, nothing to clear
                                return [2 /*return*/, { success: true }];
                            }
                            return [4 /*yield*/, this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } })];
                        case 4:
                            _a.sent();
                            if (!externalMessageId) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.processedMessage.create({
                                    data: {
                                        externalMessageId: externalMessageId,
                                        userId: userId,
                                    },
                                })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: 
                        // Recalculate cart (empty cart)
                        return [4 /*yield*/, this.prisma.cart.update({
                                where: { id: cart.id },
                                data: { subtotal: 0, deliveryFee: 0, total: 0 },
                            })];
                        case 7:
                            // Recalculate cart (empty cart)
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        return CartService_1;
    }());
    __setFunctionName(_classThis, "CartService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CartService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CartService = _classThis;
}();
exports.CartService = CartService;
