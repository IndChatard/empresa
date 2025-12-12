// Industria Chatard - Aplicación Principal
class IndustriaChatard {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('chatard_cart')) || [];
        this.products = [];
        this.categories = ['todos', 'piezas', 'estructuras', 'herramientas', 'accesorios', 'repuestos'];
        this.services = ['laser', 'plasma', 'mecanizado', 'mantenimiento'];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.updateCartUI();
        this.bindEvents();
    }

    async loadProducts() {
        try {
            // URL para cargar productos desde Google Sheets (modificar con tu URL)
            const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwZ_XXYOUR_SCRIPT_ID/exec';
            
            const response = await fetch(SHEET_URL);
            
            if (response.ok) {
                const data = await response.json();
                this.products = data.products || this.getDefaultProducts();
            } else {
                this.products = this.getDefaultProducts();
            }
            
            console.log(`✅ ${this.products.length} productos cargados`);
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.products = this.getDefaultProducts();
        }
    }

    getDefaultProducts() {
        return [
            {
                id: 'pieza-001',
                name: 'Placa de Acero Cortada Laser',
                category: 'piezas',
                allCategories: ['piezas'],
                featured: true,
                price: 1250.50,
                stock: 15,
                image: 'resources/pieza-acero.jpg',
                description: 'Placa de acero A36 cortada a medida con precisión láser',
                code: 'PLA-001',
                active: true
            },
            {
                id: 'estructura-001',
                name: 'Estructura Metálica Industrial',
                category: 'estructuras',
                allCategories: ['estructuras'],
                featured: false,
                price: 8500.00,
                stock: 8,
                image: 'resources/estructura.jpg',
                description: 'Estructura base para máquinas industriales, soldada y pintada',
                code: 'EST-001',
                active: true
            },
            {
                id: 'herramienta-001',
                name: 'Juego de Sujetadores CNC',
                category: 'herramientas',
                allCategories: ['herramientas'],
                featured: true,
                price: 350.75,
                stock: 25,
                image: 'resources/sujetadores.jpg',
                description: 'Set de 12 sujetadores para máquinas CNC, incluye llaves',
                code: 'HER-001',
                active: true
            },
            {
                id: 'repuesto-001',
                name: 'Motor Paso a Paso NEMA 23',
                category: 'repuestos',
                allCategories: ['repuestos'],
                featured: false,
                price: 1200.00,
                stock: 6,
                image: 'resources/motor-nema23.jpg',
                description: 'Motor paso a paso NEMA 23, 1.8° por paso, 2.5A',
                code: 'REP-001',
                active: true
            },
            {
                id: 'accesorio-001',
                name: 'Boquilla Corte Plasma',
                category: 'accesorios',
                allCategories: ['accesorios'],
                featured: true,
                price: 45.99,
                stock: 30,
                image: 'resources/boquilla-plasma.jpg',
                description: 'Boquilla de repuesto para corte plasma Hypertherm',
                code: 'ACC-001',
                active: true
            },
            {
                id: 'pieza-002',
                name: 'Piñón Engranaje 20 Dientes',
                category: 'piezas',
                allCategories: ['piezas'],
                featured: false,
                price: 320.00,
                stock: 12,
                image: 'resources/engranaje.jpg',
                description: 'Piñón de engranaje fabricado en acero templado, 20 dientes',
                code: 'PIN-002',
                active: true
            }
        ];
    }

    getFeaturedProducts() {
        return this.products.filter(product => product.featured && product.stock > 0 && product.active);
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showToast('Producto no encontrado', 'error');
            return false;
        }

        if (product.stock < quantity) {
            this.showToast(`Stock insuficiente. Solo quedan ${product.stock} unidades`, 'error');
            return false;
        }

        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                this.showToast(`No puedes agregar más. Stock máximo: ${product.stock}`, 'error');
                return false;
            }
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                productId: productId,
                quantity: quantity,
                price: product.price,
                name: product.name,
                image: product.image
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`${product.name} agregado al carrito`, 'success');
        return true;
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.saveCart();
        this.updateCartUI();
        this.showToast('Producto eliminado del carrito', 'success');
    }

    updateQuantity(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        const item = this.cart.find(item => item.productId === productId);
        
        if (item && product) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else if (quantity > product.stock) {
                this.showToast(`No puedes agregar más. Stock máximo: ${product.stock}`, 'error');
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('chatard_cart', JSON.stringify(this.cart));
    }

    updateCartUI() {
        const cartCounts = document.querySelectorAll('#cart-count, .cart-count');
        
        cartCounts.forEach(cartCount => {
            const count = this.getCartItemCount();
            cartCount.textContent = count > 0 ? count : '';
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        });
        
        // También actualizar en todas las páginas abiertas
        this.dispatchStorageEvent();
    }

    dispatchStorageEvent() {
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'chatard_cart',
            newValue: JSON.stringify(this.cart)
        }));
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 bg-white rounded-lg shadow-lg border-l-4 p-3 max-w-sm z-50 transition-all duration-300`;
        toast.classList.add(type === 'error' ? 'border-red-500' : 'border-green-success');
        
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="text-sm">${message}</span>
                <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    bindEvents() {
        // Escuchar cambios en el carrito desde otras pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === 'chatard_cart') {
                this.cart = JSON.parse(e.newValue) || [];
                this.updateCartUI();
            }
        });
    }

    // Método para enviar órdenes por WhatsApp
    sendOrderWhatsApp(orderData) {
        const phoneNumber = '542645776592';
        const message = this.formatOrderMessage(orderData);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        return true;
    }

    formatOrderMessage(orderData) {
        const serviceNames = {
            'laser': 'Corte Láser CNC',
            'plasma': 'Corte Plasma',
            'mecanizado': 'Centro Mecanizado',
            'mantenimiento': 'Mantenimiento Pesado'
        };

        let message = `🛠️ *NUEVO PEDIDO - Industria Chatard* 🛠️\n\n`;
        
        message += `📋 *Orden:* ${orderData.orderId}\n`;
        message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}\n`;
        message += `🕐 *Hora:* ${new Date().toLocaleTimeString('es-AR')}\n\n`;
        
        if (orderData.type === 'service') {
            message += `👤 *CLIENTE*\n`;
            message += `▫️ Nombre: ${orderData.customer.name}\n`;
            message += `▫️ Teléfono: ${orderData.customer.phone}\n`;
            message += `▫️ Email: ${orderData.customer.email || 'No especificado'}\n\n`;
            
            message += `🛠️ *SERVICIO SOLICITADO*\n`;
            message += `▫️ ${serviceNames[orderData.service] || orderData.service}\n`;
            message += `▫️ Descripción: ${orderData.description}\n\n`;
            
            if (orderData.material) message += `▫️ Material: ${orderData.material}\n`;
            if (orderData.quantity) message += `▫️ Cantidad: ${orderData.quantity}\n`;
            if (orderData.deadline) message += `▫️ Plazo: ${orderData.deadline}\n`;
            
        } else if (orderData.type === 'product') {
            message += `👤 *CLIENTE*\n`;
            message += `▫️ ${orderData.customer.name}\n`;
            message += `▫️ ${orderData.customer.phone}\n`;
            message += `▫️ ${orderData.customer.address}\n\n`;
            
            message += `📦 *PRODUCTOS*\n`;
            orderData.items.forEach((item, index) => {
                message += `${index + 1}. ${item.name} x${item.quantity}\n`;
                message += `   Precio: $${item.price.toFixed(2)} c/u\n`;
                message += `   Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
            });
            
            message += `💰 *TOTAL: $${orderData.total.toFixed(2)}*\n\n`;
        }
        
        message += `📍 *ENVIADO DESDE WEB:* ${window.location.origin}`;
        
        return message;
    }

    // Método para enviar a Google Forms
    submitToGoogleForm(formData, formUrl) {
        // Crear formulario oculto
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = formUrl;
        form.target = '_blank';
        form.style.display = 'none';

        // Agregar campos
        Object.entries(formData).forEach(([name, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        
        setTimeout(() => {
            document.body.removeChild(form);
        }, 1000);
    }

    // Método para refrescar productos
    async refreshProducts() {
        await this.loadProducts();
        this.showToast('Productos actualizados', 'success');
        return this.products;
    }
}

// Inicializar aplicación global
document.addEventListener('DOMContentLoaded', () => {
    window.chatardApp = new IndustriaChatard();
});

// Funciones globales para uso en HTML
function addToCart(productId, quantity = 1) {
    if (window.chatardApp) {
        return window.chatardApp.addToCart(productId, quantity);
    }
    return false;
}

function removeFromCart(productId) {
    if (window.chatardApp) {
        window.chatardApp.removeFromCart(productId);
    }
}

function updateQuantity(productId, quantity) {
    if (window.chatardApp) {
        window.chatardApp.updateQuantity(productId, quantity);
    }
}

function refreshProducts() {
    if (window.chatardApp) {
        return window.chatardApp.refreshProducts();
    }
}

// Helper para formatear precios
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(price);
}
