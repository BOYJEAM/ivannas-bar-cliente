let tempCart = [];
let tempPlaylist = [];
let accountCart = [];
let accountPlaylist = [];
let propina = 0;
let totalCuenta = 0;

const modals = document.querySelectorAll('.modal');
const closeBtns = document.querySelectorAll('.close-btn');
const carouselContainer = document.getElementById('carousel-container');
const items = document.querySelectorAll('.carousel-item');
const sonido = document.getElementById('sonido-carrusel');
let currentIndex = 2;
let startX = 0;
let isSwiping = false;
let audioUnlocked = false;

function cerrarModales() {
    modals.forEach(m => m.style.display = 'none');
    document.getElementById('propina-gif-container').classList.remove('visible');
}

closeBtns.forEach(btn => btn.addEventListener('click', cerrarModales));
modals.forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModales(); }));

function updateCarousel() {
    items.forEach((item, i) => {
        const diff = i - currentIndex;
        let translateX = 0, rotateY = 0, scale = 1, opacity = 1;
        if (diff === 0) { translateX = 0; rotateY = 0; scale = 1.1; opacity = 1; }
        else if (diff === 1 || diff === -4) { translateX = 161; rotateY = -25; scale = 0.85; opacity = 0.8; }
        else if (diff === -1 || diff === 4) { translateX = -161; rotateY = 25; scale = 0.85; opacity = 0.8; }
        else if (diff === 2 || diff === -3) { translateX = 322; rotateY = -50; scale = 0.7; opacity = 0.6; }
        else if (diff === -2 || diff === 3) { translateX = -322; rotateY = 50; scale = 0.7; opacity = 0.6; }
        item.style.transform = `translateX(${translateX}px) translateZ(100px) rotateY(${rotateY}deg) scale(${scale})`;
        item.style.opacity = opacity;
    });
}

function unlockAudio() {
    if (!audioUnlocked && sonido) {
        sonido.volume = 0;
        sonido.play().then(() => {
            sonido.pause();
            sonido.currentTime = 0;
            sonido.volume = 0.55;
            audioUnlocked = true;
            document.body.removeEventListener('touchstart', unlockAudio);
            document.body.removeEventListener('click', unlockAudio);
        }).catch(() => {});
    }
}

document.body.addEventListener('touchstart', unlockAudio, { passive: true });
document.body.addEventListener('click', unlockAudio);

carouselContainer.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isSwiping = false;
});

carouselContainer.addEventListener('touchmove', e => {
    if (Math.abs(e.touches[0].clientX - startX) > 10) {
        isSwiping = true;
    }
});

carouselContainer.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (isSwiping && Math.abs(diff) > 50) {
        if (diff > 0) {
            currentIndex = (currentIndex + 1) % 5;
        } else {
            currentIndex = (currentIndex - 1 + 5) % 5;
        }
        updateCarousel();
        if (sonido) {
            sonido.currentTime = 0;
            sonido.volume = 0.55;
            sonido.play().catch(() => {});
        }
    }
    isSwiping = false;
});

items.forEach(item => {
    item.addEventListener('click', (e) => {
        if (!isSwiping) {
            cerrarModales();
            const category = item.dataset.category;
            document.getElementById(`${category}-modal`).style.display = 'flex';
        }
    });
});

updateCarousel();

const addBtns = document.querySelectorAll('.add-btn');
addBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        const text = e.target.parentElement.textContent;
        const name = text.split('$')[0].trim();
        const priceMatch = text.match(/\$(\d+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
        const isRockola = text.includes('gratis');
       
        if (isRockola) {
            tempPlaylist.push(name);
            updatePlaylistDisplay();
        } else {
            tempCart.push({name, price});
        }
        updateFloatingList();
        document.getElementById('floating-list').classList.add('visible');
        const content = document.getElementById('floating-list-content');
        content.classList.add('new-item');
        setTimeout(() => content.classList.remove('new-item'), 300);
    });
});

function updatePlaylistDisplay() {
    const playlistDiv = document.getElementById('playlist-display');
    playlistDiv.innerHTML = '';
   
    if (tempPlaylist.length === 0) {
        playlistDiv.classList.add('empty');
    } else {
        playlistDiv.classList.remove('empty');
        tempPlaylist.forEach(song => {
            const div = document.createElement('div');
            div.textContent = song;
            playlistDiv.appendChild(div);
        });
    }
}

function updateFloatingList() {
    const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = '';
    tempCart.forEach((item, i) => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `${item.name} $${item.price} <button class="remove-btn" data-index="${i}" data-type="cart">QUITAR</button>`;
        cartDiv.appendChild(div);
    });
   
    const playlistDiv = document.getElementById('playlist-cart');
    playlistDiv.innerHTML = '';
    tempPlaylist.forEach((song, i) => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `${song} <button class="remove-btn" data-index="${i}" data-type="playlist">QUITAR</button>`;
        playlistDiv.appendChild(div);
    });
   
    const total = tempCart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total').textContent = `Total: $${total}`;
   
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = () => {
            const i = btn.dataset.index;
            const type = btn.dataset.type;
            if (type === 'cart') tempCart.splice(i, 1);
            else {
                tempPlaylist.splice(i, 1);
                updatePlaylistDisplay();
            }
            updateFloatingList();
            if (tempCart.length + tempPlaylist.length === 0) document.getElementById('floating-list').classList.remove('visible');
        };
    });
}

document.getElementById('order-btn').addEventListener('click', () => {
    accountCart = accountCart.concat(tempCart);
    accountPlaylist = accountPlaylist.concat(tempPlaylist);
    tempCart = [];
    tempPlaylist = [];
    updateFloatingList();
    updatePlaylistDisplay();
    document.getElementById('floating-list').classList.remove('visible');
    cerrarModales();
    const successMessage = document.getElementById('order-success-message');
    successMessage.classList.add('visible');
    setTimeout(() => successMessage.classList.remove('visible'), 7000);
});

document.getElementById('recibo-btn').addEventListener('click', () => {
    cerrarModales();
    updateRecibo();
    document.getElementById('recibo-modal').style.display = 'flex';
});

function updateRecibo() {
    const reciboItems = document.getElementById('recibo-items');
    reciboItems.innerHTML = '';
    accountCart.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `<span>${item.name}</span><span>$${item.price}</span>`;
        reciboItems.appendChild(div);
    });
   
    const reciboPlaylist = document.getElementById('recibo-playlist');
    reciboPlaylist.innerHTML = '';
    accountPlaylist.forEach(song => {
        const div = document.createElement('div');
        div.innerHTML = `<span>${song}</span><span>$0</span>`;
        reciboPlaylist.appendChild(div);
    });
   
    const total = accountCart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('recibo-total').textContent = `Total: $${total}`;
}

document.getElementById('pagar-btn').addEventListener('click', () => {
    cerrarModales();
    updatePagar();
    document.getElementById('pagar-overlay').style.display = 'flex';
});

function updatePagar() {
    const pagarItems = document.getElementById('pagar-items');
    pagarItems.innerHTML = '';
    accountCart.forEach(item => {
        const div = document.createElement('div');
        div.textContent = `${item.name} $${item.price}`;
        pagarItems.appendChild(div);
    });
   
    const pagarPlaylist = document.getElementById('pagar-playlist');
    pagarPlaylist.innerHTML = '';
    accountPlaylist.forEach(song => {
        const div = document.createElement('div');
        div.textContent = song;
        pagarPlaylist.appendChild(div);
    });
   
    const total = accountCart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('pagar-total').textContent = `Total: $${total}`;
}

document.getElementById('confirmar-btn').addEventListener('click', () => {
    document.getElementById('pagar-overlay').style.display = 'none';
    totalCuenta = accountCart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('propina-total').textContent = `Total actual: $${totalCuenta}`;
    document.getElementById('propina-modal').style.display = 'flex';
    document.getElementById('propina-gif-container').classList.add('visible');
});

document.querySelectorAll('.propina-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        propina = parseFloat(e.target.dataset.amount);
        const nuevoTotal = totalCuenta + propina;
        document.getElementById('propina-total').textContent = `Total con propina: $${nuevoTotal}`;
    });
});

document.getElementById('otro-propina').addEventListener('click', () => {
    document.getElementById('custom-propina').style.display = 'block';
});

document.getElementById('custom-propina').addEventListener('input', e => {
    propina = parseFloat(e.target.value) || 0;
    const nuevoTotal = totalCuenta + propina;
    document.getElementById('propina-total').textContent = `Total con propina: $${nuevoTotal}`;
});

document.getElementById('pagar-final-btn').addEventListener('click', () => {
    const custom = document.getElementById('custom-propina').value;
    if (custom) propina = parseFloat(custom);
    document.getElementById('propina-modal').style.display = 'none';
    document.getElementById('propina-gif-container').classList.remove('visible');
    document.getElementById('despedida-modal').style.display = 'flex';
    setTimeout(() => {
        tempCart = [];
        tempPlaylist = [];
        accountCart = [];
        accountPlaylist = [];
        propina = 0;
        totalCuenta = 0;
        updateFloatingList();
        updatePlaylistDisplay();
        modals.forEach(m => m.style.display = 'none');
    }, 5000);
});

document.getElementById('despedida-modal').addEventListener('click', () => {
    tempCart = [];
    tempPlaylist = [];
    accountCart = [];
    accountPlaylist = [];
    propina = 0;
    totalCuenta = 0;
    updateFloatingList();
    updatePlaylistDisplay();
    modals.forEach(m => m.style.display = 'none');
});

const gifImg = document.getElementById('propina-gif');
gifImg.addEventListener('mousedown', () => {
    gifImg.src = 'assets/images/propinas2.gif';
    gifImg.style.position = 'fixed';
    gifImg.style.top = '50%';
    gifImg.style.left = '50%';
    gifImg.style.transform = 'translate(-50%, -50%) scale(4.2)';
    gifImg.style.zIndex = '40';
    gifImg.style.transition = 'all 0.2s ease';
});

gifImg.addEventListener('mouseup', () => {
    gifImg.src = 'assets/images/propinas.gif';
    gifImg.style.transform = 'scale(1)';
    gifImg.style.position = '';
    gifImg.style.top = '';
    gifImg.style.left = '';
    gifImg.style.zIndex = '';
});

gifImg.addEventListener('mouseleave', () => {
    gifImg.src = 'assets/images/propinas.gif';
    gifImg.style.transform = 'scale(1)';
    gifImg.style.position = '';
    gifImg.style.top = '';
    gifImg.style.left = '';
    gifImg.style.zIndex = '';
});

gifImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    gifImg.src = 'assets/images/propinas2.gif';
    gifImg.style.position = 'fixed';
    gifImg.style.top = '50%';
    gifImg.style.left = '50%';
    gifImg.style.transform = 'translate(-50%, -50%) scale(4.2)';
    gifImg.style.zIndex = '40';
});

gifImg.addEventListener('touchend', () => {
    gifImg.src = 'assets/images/propinas.gif';
    gifImg.style.transform = 'scale(1)';
    gifImg.style.position = '';
    gifImg.style.top = '';
    gifImg.style.left = '';
    gifImg.style.zIndex = '';
});

const llamarMeseroBtn = document.getElementById('llamar-mesero-btn');
const llamarMeseroModal = document.getElementById('llamar-mesero-modal');
const confirmarMesero = document.getElementById('confirmar-mesero');
const cancelarMesero = document.getElementById('cancelar-mesero');
const meseroMessage = document.getElementById('mesero-message');

llamarMeseroBtn.addEventListener('click', () => {
    llamarMeseroModal.style.display = 'flex';
});

cancelarMesero.addEventListener('click', () => {
    llamarMeseroModal.style.display = 'none';
});

confirmarMesero.addEventListener('click', () => {
    llamarMeseroModal.style.display = 'none';
    meseroMessage.classList.add('visible');
    setTimeout(() => {
        meseroMessage.classList.remove('visible');
    }, 5000);
});

llamarMeseroModal.addEventListener('click', (e) => {
    if (e.target === llamarMeseroModal) {
        llamarMeseroModal.style.display = 'none';
    }
});

updatePlaylistDisplay();