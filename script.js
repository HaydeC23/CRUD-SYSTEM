// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, app, db } from './firebase-config.js';

// Referencia a la colección de productos
const productsCollection = collection(db, 'products');
const IMGBB_API_KEY = 'aa44679d43268f841400ee9fb80c3b6c'; // Tu API key de ImgBB

// Verificar si Firebase está inicializado
document.addEventListener('DOMContentLoaded', () => {
    if (!app) {
        console.error('Firebase no está inicializado correctamente');
        return;
    }

    const btnAddProduct = document.getElementById('btnAddProduct');
    const btnCancelForm = document.getElementById('cancelForm');
    const productForm = document.getElementById('productForm');
    const productFormContent = document.getElementById('productFormContent');
    const productsGrid = document.getElementById('productsGrid');
    const statusMessage = document.getElementById('statusMessage');
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    let selectedImage = null;

    // Función para mostrar el formulario
    function showForm() {
        productForm.classList.remove('hidden');
    }

    // Función para ocultar el formulario
    function hideForm() {
        productFormContent.reset();
        productForm.classList.add('hidden');
        imagePreview.innerHTML = '';
        selectedImage = null;
    }

    // Función para mostrar mensaje de estado
    function showMessage(message, type = 'error') {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.classList.remove('hidden');
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 3000);
    }

    // Función para subir imagen a ImgBB
    async function uploadImageToImgBB(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data.url; // Retorna la URL de la imagen
            } else {
                throw new Error('Error al subir la imagen a ImgBB');
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        }
    }

    // Función para crear un nuevo producto
    async function createProduct(productData) {
        try {
            const docRef = await addDoc(productsCollection, productData);
            console.log('Producto creado con ID:', docRef.id);
            showMessage('Producto creado exitosamente', 'success');
            renderProducts();
            hideForm();
            return docRef.id;
        } catch (error) {
            console.error('Error al crear el producto:', error);
            showMessage('Error al crear el producto: ' + error.message);
            throw error;
        }
    }

    // Función para obtener todos los productos
    async function getProducts() {
        try {
            const q = query(productsCollection);
            const querySnapshot = await getDocs(q);
            const products = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Productos obtenidos:', products);
            return products;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            showMessage('Error al obtener productos: ' + error.message);
            return [];
        }
    }

    // Función para eliminar un producto
    async function deleteProduct(productId) {
        try {
            await deleteDoc(doc(productsCollection, productId));
            console.log('Producto eliminado:', productId);
            showMessage('Producto eliminado exitosamente', 'success');
            renderProducts();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            showMessage('Error al eliminar producto: ' + error.message);
        }
    }

    // Función para actualizar un producto
    async function updateProduct(productId, updatedData) {
        try {
            await updateDoc(doc(productsCollection, productId), updatedData);
            console.log('Producto actualizado:', productId);
            showMessage('Producto actualizado exitosamente', 'success');
            renderProducts();
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            showMessage('Error al actualizar producto: ' + error.message);
        }
    }

    // Función para renderizar los productos en la página
    async function renderProducts() {
        try {
            const products = await getProducts();
            productsGrid.innerHTML = '';

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // Mostrar la imagen si existe
                const productImage = product.imageUrl 
                    ? `<div class="product-image"><img src="${product.imageUrl}" alt="${product.name}"></div>`
                    : '';
                
                productCard.innerHTML = `
                    ${productImage}
                    <h3>${product.name}</h3>
                    <div class="product-info">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <span class="product-original-price">$${product.originalPrice.toFixed(2)}</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <button onclick="editProduct('${product.id}')" class="action-btn edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct('${product.id}')" class="action-btn delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                productsGrid.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error al renderizar productos:', error);
            showMessage('Error al cargar productos: ' + error.message);
        }
    }

    // Evento para manejar la selección de imagen
    productImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedImage = file;
            
            // Mostrar vista previa de la imagen
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="Vista previa de la imagen">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Evento para enviar el formulario
    productFormContent.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = productFormContent.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        try {
            let imageUrl = '';
            
            // Si hay una imagen seleccionada, subirla primero
            if (selectedImage) {
                showMessage('Subiendo imagen...', 'info');
                imageUrl = await uploadImageToImgBB(selectedImage);
            }
            
            const productData = {
                name: document.getElementById('name').value,
                price: parseFloat(document.getElementById('price').value),
                originalPrice: parseFloat(document.getElementById('originalPrice').value),
                description: document.getElementById('description').value,
                imageUrl: imageUrl, // URL de la imagen subida
                timestamp: new Date()
            };

            if (!productData.name || !productData.price || !productData.originalPrice || !productData.description) {
                throw new Error('Por favor, complete todos los campos requeridos');
            }

            await createProduct(productData);
        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message || 'Ocurrió un error al guardar el producto');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });

    // Evento para mostrar/ocultar el formulario
    btnAddProduct.addEventListener('click', () => {
        showForm();
    });

    // Evento para cancelar el formulario
    btnCancelForm.addEventListener('click', () => {
        hideForm();
    });

    // Inicializar la aplicación
    renderProducts();
});

// Hacer las funciones accesibles globalmente para los botones en las tarjetas
window.deleteProduct = async function(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        try {
            await deleteDoc(doc(productsCollection, productId));
            showMessage('Producto eliminado exitosamente', 'success');
            document.querySelector(`[data-product-id="${productId}"]`)?.remove();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            showMessage('Error al eliminar producto: ' + error.message);
        }
    }
};

window.editProduct = function(productId) {
    // Implementar lógica de edición si es necesario
    console.log('Editar producto:', productId);
};
