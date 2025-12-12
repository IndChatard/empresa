// Industria Chatard - Aplicación Principal Actualizada
class IndustriaChatard {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('chatard_cart')) || [];
        this.products = [];
        this.services = [];
        this.categories = ['todos', 'piezas', 'estructuras', 'herramientas', 'accesorios', 'repuestos'];
        this.serviceCategories = ['corte', 'mecanizado', 'mantenimiento', 'otros'];
        this.init();
    }

    async init() {
        await this.loadDataFromSheet();
        this.updateCartUI();
        this.bindEvents();
    }

    async loadDataFromSheet() {
        try {
            console.log('🔄 Cargando datos desde Google Sheet...');
            
            // 🔥 TU URL DE GOOGLE APPS SCRIPT
            const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbx56rflxsf0hQ_Mkxsv1k2vNgEKeehiF4StJAp66lg-K_W9PeK1DCx8jNVlTpHGKLm9Jw/exec';
            
            const response = await fetch(WEBAPP_URL);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.products = data.products || [];
                this.services = data.services || [];
                
                console.log(`✅ Datos cargados: ${this.products.length} productos, ${this.services.length} servicios`);
                console.log('📊 Estadísticas:', data.stats);
                
                // Disparar evento para que las páginas se actualicen
                this.dispatchDataLoadedEvent();
                
            } else {
                throw new Error(data.error || 'Error en la respuesta del servidor');
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            
            // Datos de ejemplo para desarrollo
            this.products = this.getDefaultProducts();
            this.services = this.getDefaultServices();
            
            console.log('🔄 Usando datos de ejemplo para desarrollo');
            this.dispatchDataLoadedEvent();
        }
    }

    dispatchDataLoadedEvent() {
        window.dispatchEvent(new CustomEvent('chatardDataLoaded', {
            detail: {
                products: this.products,
                services: this.services
            }
        }));
    }

    getDefaultProducts() {
        return [
            {
                id: 'PLA-001',
                name: 'Placa de Acero A36 5mm',
                description: 'Placa de acero al carbono cortada a medida con láser CNC',
                code: 'PLA-5MM-001',
                price: 1250.50,
                stock: 15,
                category: 'piezas',
                allCategories: ['piezas', 'acero', 'planchuela'],
                rubro: 'Producto',
                featured: true,
                active: true,
                image: 'resources/placa-acero.jpg',
                shippingCost: 0,
                dimensions: '1000x500x5 mm',
                weight: 2.5,
                material: 'Acero A36',
                color: 'Natural',
                fabricationTime: '3-5 días',
                warranty: '12 meses'
            },
            {
                id: 'EST-001',
                name: 'Estructura Metálica Base',
                description: 'Estructura base para máquinas industriales',
                code: 'EST-BASE-001',
                price: 8500.00,
                stock: 8,
                category: 'estructuras',
                allCategories: ['estructuras', 'soldadas'],
                rubro: 'Producto',
                featured: false,
                active: true,
                image: 'resources/estructura.jpg',
                shippingCost: 500,
                dimensions: '2000x1000x800 mm',
                weight: 45,
                material: 'Acero estructural',
                color: 'Gris industrial',
                fabricationTime: '7-10 días',
                warranty: '24 meses'
            },
            {
                id: 'HER-001',
                name: 'Juego de Sujetadores CNC',
                description: 'Set de 12 sujetadores para máquinas CNC',
                code: 'HER-CNC-001',
                price: 350.75,
                stock: 25,
                category: 'herramientas',
                allCategories: ['herramientas', 'accesorios'],
                rubro: 'Producto',
                featured: true,
                active: true,
                image: 'resources/sujetadores.jpg',
                shippingCost: 150,
                dimensions: '30x20x5 cm',
                weight: 0.8,
                material: 'Acero templado',
                color: 'Negro',
                fabricationTime: 'Inmediato',
                warranty: '6 meses'
            },
            {
                id: 'REP-001',
                name: 'Motor Paso a Paso NEMA 23',
                description: 'Motor paso a paso para CNC, 1.8° por paso',
                code: 'MOT-NEMA23-001',
                price: 1200.00,
                stock: 6,
                category: 'repuestos',
                allCategories: ['repuestos', 'electricos'],
                rubro: 'Producto',
                featured: false,
                active: true,
                image: 'resources/motor-nema23.jpg',
                shippingCost: 200,
                dimensions: '57x57x56 mm',
                weight: 0.4,
                material: 'Acero/Imán',
                color: 'Negro/Dorado',
                fabricationTime: '2-3 días',
                warranty: '12 meses'
            }
        ];
    }

    getDefaultServices() {
        return [
            {
                id: 'SER-001',
                name: 'Corte Láser CNC',
                description: 'Corte de precisión en metales con láser CNC de última generación',
                rubro: 'Servicio',
                category: 'corte',
                featured: true,
                active: true,
                image: 'resources/laser-cnc.jpg',
                minPrice: 5000,
                priceType: 'm2',
                estimatedTime: '24-48 horas',
                capabilities: 'Hasta 25mm espesor, mesa 3000x1500mm',
                materials: 'Acero, Aluminio, Cobre, Latón',
                requirements: 'Archivo DXF/DWG, especificaciones técnicas'
            },
            {
                id: 'SER-002',
                name: 'Corte Plasma',
                description: 'Corte de alta velocidad en materiales gruesos',
                rubro: 'Servicio',
                category: 'corte',
                featured: true,
                active: true,
                image: 'resources/plasma.jpg',
                minPrice: 3000,
                priceType: 'm2',
                estimatedTime: '24-72 horas',
                capabilities: 'Hasta 50mm espesor, mesa 4000x2000mm',
                materials: 'Acero al carbono, planchuela',
                requirements: 'Archivo DXF/DWG, espesor especificado'
            },
            {
                id: 'SER-003',
                name: 'Centro Mecanizado CNC',
                description: 'Fabricación de piezas complejas con máquinas de 5 ejes',
                rubro: 'Servicio',
                category: 'mecanizado',
                featured: true,
                active: true,
                image: 'resources/centro-mecanizado.jpg',
                minPrice: 8000,
                priceType: 'hora',
                estimatedTime: '3-7 días',
                capabilities: '5 ejes simultáneos, precisión 0.01mm',
                materials: 'Acero, Aluminio, Plásticos de ingeniería',
                requirements: 'Modelo 3D (STEP/IGES), plano técnico'
            },
            {
                id: 'SER-004',
                name: 'Mantenimiento Pesado',
                description: 'Servicio especializado para vehículos industriales',
                rubro: 'Servicio',
                category: 'mantenimiento',
                featured: true,
                active: true,
                image: 'resources/mantenimiento.jpg',
                minPrice: 10000,
                priceType: 'servicio',
                estimatedTime: '1-3 días',
                capabilities: 'Mantenimiento preventivo y correctivo',
                materials: 'Todos los tipos de vehículos pesados',
                requirements: 'Diagnóstico previo, disponibilidad del vehículo'
            }
        ];
    }

    // 🔥 FUNCIÓN ACTUALIZADA PARA ENVIAR A GOOGLE FORM
    submitToGoogleForm(orderData) {
        // 🔥 TU URL DE GOOGLE FORM
        const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSddgt48q8DGbtbg0MA6VwfjwbqiPZ0Rt6ZxgkVGBqYGTjJ9rQ/formResponse';
        
        // 🔥 MAPPING DE TUS ENTRY IDs
        const formData = {
            'entry.411306303': orderData.orderId,                    // ID de Pedido
            'entry.87325142': orderData.createdAt,                   // Fecha y Hora
            'entry.1384590306': orderData.customer.firstName,        // Nombre
            'entry.1339370619': orderData.customer.lastName,         // Apellido
            'entry.1723137940': orderData.customer.phone,            // Teléfono
            'entry.1197872688': orderData.customer.email || '',      // Email
            'entry.171864356': orderData.customer.company || '',     // Empresa
            'entry.2072946741': orderData.requestType || 'Compra de Productos', // Tipo Solicitud
            'entry.976881798': this.getServiceName(orderData.service), // Servicio Requerido
            'entry.1741428090': this.formatAddress(orderData.customer.address), // Dirección Completa
            'entry.1388641277': orderData.customer.address.neighborhood, // Barrio
            'entry.1892198459': orderData.customer.address.city,     // Ciudad
            'entry.2041631929': this.getDeliveryTimeText(orderData.deliveryTime), // Horario de Entrega
            'entry.1824153295': orderData.customer.address.references || '', // Referencias
            'entry.747248552': this.formatProductsList(orderData.items), // Lista de Productos
            'entry.1896614727': `$${orderData.total.toFixed(2)}`,     // Total del Pedido
            'entry.1480807385': orderData.notes || '',               // Notas Adicionales
            'entry.2093305046': orderData.paymentMethod || 'Efectivo', // Forma de Pago
            'entry.1502548029': JSON.stringify(orderData, null, 2)   // Datos Completos (JSON)
        };

        console.log('📤 Enviando a Google Form:', Object.keys(formData).length, 'campos');
        this.submitFormData(FORM_URL, formData);
        return formData;
    }

    submitFormData(formUrl, data) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = formUrl;
        form.target = '_blank';
        form.style.display = 'none';

        Object.entries(data).forEach(([name, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        
        const iframe = document.createElement('iframe');
        iframe.name = 'formTarget';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        form.target = 'formTarget';
        
        form.submit();
        
        setTimeout(() => {
            if (form.parentNode) document.body.removeChild(form);
            if (iframe.parentNode) document.body.removeChild(iframe);
        }, 3000);
        
        console.log('✅ Formulario enviado exitosamente');
        return true;
    }

    // Funciones auxiliares
    getServiceName(serviceCode) {
        const servicesMap = {
            'laser': 'Corte Láser CNC',
            'plasma': 'Corte Plasma',
            'mecanizado': 'Centro Mecanizado',
            'hilo': 'Electroerosión por Hilo',
            'mantenimiento': 'Mantenimiento Pesado',
            'cotizacion': 'Cotización General'
        };
        return servicesMap[serviceCode] || serviceCode;
    }

    getDeliveryTimeText(time) {
        const times = {
            'morning': 'Mañana (9:00-12:00)',
            'afternoon': 'Tarde (14:00-18:00)',
            'evening': 'Noche (19:00-21:00)'
        };
        return times[time] || time;
    }

    formatAddress(address) {
        let direccion = `${address.street} ${address.number}`;
        if (address.floor) direccion += `, Piso ${address.floor}`;
        if (address.apartment) direccion += `, Depto ${address.apartment}`;
        direccion += `, ${address.neighborhood}, ${address.city}`;
        return direccion;
    }

    formatProductsList(items) {
        if (!items || items.length === 0) return 'No hay productos';
        
        let productList = '';
        let totalCalculado = 0;
        
        items.forEach((item, index) => {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                const subtotal = product.price * item.quantity;
                totalCalculado += subtotal;
                
                productList += `${index + 1}. ${product.name}\n`;
                productList += `   Código: ${product.code}\n`;
                productList += `   Cantidad: ${item.quantity} unidades\n`;
                productList += `   Precio: $${product.price.toFixed(2)} c/u\n`;
                productList += `   Subtotal: $${subtotal.toFixed(2)}\n`;
                if (product.material) productList += `   Material: ${product.material}\n`;
                if (product.dimensions) productList += `   Dimensiones: ${product.dimensions}\n`;
                productList += '\n';
            } else {
                productList += `${index + 1}. Producto ID: ${item.productId}\n`;
                productList += `   Cantidad: ${item.quantity} unidades\n\n`;
            }
        });
        
        productList += `---\nTOTAL CALCULADO: $${totalCalculado.toFixed(2)}`;
        return productList;
    }

    // Funciones del carrito
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showToast('Producto no encontrado', 'error');
            return false;
        }

        // Verificar stock
        if (product.stock < quantity) {
            this.showToast(`Stock insuficiente. Solo quedan ${product.stock} unidades`, 'error');
            return false;
        }

        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            // Verificar que no exceda el stock total
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
                image: product.image,
                code: product.code,
                shippingCost: product.shippingCost || 0
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
        const subtotal = this.cart.reduce((total, item) => {
            const product = this.products.find(p => p.id === item.productId);
            return total + ((product?.price || item.price || 0) * item.quantity);
        }, 0);
        
        const shipping = this.cart.reduce((total, item) => {
            return total + (item.shippingCost || 0);
        }, 0);
        
        return {
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping
        };
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('chatard_cart', JSON.stringify(this.cart));
        this.dispatchCartUpdatedEvent();
    }

    dispatchCartUpdatedEvent() {
        window.dispatchEvent(new CustomEvent('chatardCartUpdated', {
            detail: { cart: this.cart }
        }));
    }

    updateCartUI() {
        const cartCounts = document.querySelectorAll('#cart-count, .cart-count, #header-cart-count');
        const cartTotalElements = document.querySelectorAll('#cart-total, .cart-total');
        
        const count = this.getCartItemCount();
        const totals = this.getCartTotal();
        
        cartCounts.forEach(cartCount => {
            if (cartCount) {
                cartCount.textContent = count > 0 ? count : '';
                cartCount.style.display = count > 0 ? 'flex' : 'none';
            }
        });
        
        cartTotalElements.forEach(element => {
            if (element) {
                element.textContent = `$${totals.total.toFixed(2)}`;
            }
        });
        
        // Actualizar en otras pestañas
        localStorage.setItem('chatard_cart_updated', Date.now().toString());
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 bg-white rounded-lg shadow-lg border-l-4 p-3 max-w-sm z-50 transition-all duration-300`;
        toast.classList.add(type === 'error' ? 'border-red-500' : 'border-green-success');
        
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="text-sm">${message}</span>
                <button class="ml-4 text-gray-400 hover:text-gray-600 transition-colors" 
                        onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animación de entrada
        setTimeout(() => {
            toast.classList.add('opacity-100');
        }, 10);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0');
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
            if (e.key === 'chatard_cart_updated') {
                const currentCart = JSON.parse(localStorage.getItem('chatard_cart')) || [];
                if (JSON.stringify(currentCart) !== JSON.stringify(this.cart)) {
                    this.cart = currentCart;
                    this.updateCartUI();
                }
            }
        });
        
        // Escuchar evento personalizado de datos cargados
        window.addEventListener('chatardDataLoaded', (e) => {
            this.products = e.detail.products || [];
            this.services = e.detail.services || [];
            console.log('📦 Datos actualizados desde evento');
        });
    }

    // Método para enviar órdenes por WhatsApp
    sendOrderWhatsApp(orderData) {
        const phoneNumber = '542646195548';
        const message = this.formatWhatsAppOrderMessage(orderData);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        return true;
    }

    formatWhatsAppOrderMessage(orderData) {
        let message = `🛠️ *NUEVO PEDIDO - Industria Chatard* 🛠️\n\n`;
        
        message += `📋 *Orden:* ${orderData.orderId}\n`;
        message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}\n`;
        message += `🕐 *Hora:* ${new Date().toLocaleTimeString('es-AR')}\n\n`;
        
        message += `👤 *CLIENTE*\n`;
        message += `▫️ Nombre: ${orderData.customer.firstName} ${orderData.customer.lastName}\n`;
        message += `▫️ Teléfono: ${orderData.customer.phone}\n`;
        if (orderData.customer.email) message += `▫️ Email: ${orderData.customer.email}\n`;
        if (orderData.customer.company) message += `▫️ Empresa: ${orderData.customer.company}\n`;
        
        message += `\n📍 *DIRECCIÓN DE ENTREGA*\n`;
        message += `▫️ ${orderData.customer.address.street} ${orderData.customer.address.number}\n`;
        message += `▫️ ${orderData.customer.address.neighborhood}, ${orderData.customer.address.city}\n`;
        if (orderData.customer.address.references) {
            message += `▫️ Referencias: ${orderData.customer.address.references}\n`;
        }
        
        message += `\n🕐 *HORARIO: ${this.getDeliveryTimeText(orderData.deliveryTime)}*\n\n`;
        
        if (orderData.items && orderData.items.length > 0) {
            message += `📦 *PRODUCTOS SOLICITADOS*\n`;
            orderData.items.forEach((item, index) => {
                const product = this.products.find(p => p.id === item.productId);
                if (product) {
                    message += `${index + 1}. ${product.name}\n`;
                    message += `   ▫️ Código: ${product.code}\n`;
                    message += `   ▫️ Cantidad: ${item.quantity}\n`;
                    message += `   ▫️ Precio: $${product.price.toFixed(2)} c/u\n`;
                    message += `   ▫️ Subtotal: $${(product.price * item.quantity).toFixed(2)}\n\n`;
                }
            });
            
            const totals = this.getCartTotal();
            message += `💰 *RESUMEN DE PAGO*\n`;
            message += `▫️ Subtotal: $${totals.subtotal.toFixed(2)}\n`;
            message += `▫️ Envío: $${totals.shipping.toFixed(2)}\n`;
            message += `▫️ *TOTAL: $${totals.total.toFixed(2)}*\n\n`;
        }
        
        if (orderData.service) {
            message += `🛠️ *SERVICIO SOLICITADO*\n`;
            message += `▫️ ${this.getServiceName(orderData.service)}\n`;
            if (orderData.notes) message += `▫️ Notas: ${orderData.notes}\n`;
            message += `\n`;
        }
        
        message += `💳 *FORMA DE PAGO:* ${orderData.paymentMethod || 'A convenir'}\n\n`;
        message += `📝 *ENVIADO DESDE WEB:* ${window.location.origin}\n`;
        message += `⏰ *HORA DE RECEPCIÓN:* ${new Date().toLocaleTimeString('es-AR')}`;
        
        return message;
    }

    // Método para refrescar datos
    async refreshData() {
        await this.loadDataFromSheet();
        this.showToast('Datos actualizados correctamente', 'success');
        return {
            products: this.products,
            services: this.services
        };
    }

    // Métodos para obtener datos filtrados
    getFeaturedProducts() {
        return this.products.filter(product => product.featured && product.active && product.stock > 0);
    }

    getFeaturedServices() {
        return this.services.filter(service => service.featured && service.active);
    }

    getProductsByCategory(category) {
        if (category === 'todos') {
            return this.products.filter(product => product.active && product.stock > 0);
        }
        return this.products.filter(product => 
            product.active && 
            product.stock > 0 && 
            (product.category === category || 
             (product.allCategories && product.allCategories.includes(category)))
        );
    }

    getServicesByCategory(category) {
        if (category === 'todos') {
            return this.services.filter(service => service.active);
        }
        return this.services.filter(service => 
            service.active && 
            service.category === category
        );
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

function refreshData() {
    if (window.chatardApp) {
        return window.chatardApp.refreshData();
    }
}

// Helper para formatear precios
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(price);
}

// Helper para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
