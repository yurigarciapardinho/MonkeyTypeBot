const menuHTML = `
  <dialog id="modMenu" style="padding: 20px; border-radius: 8px; border: 1px solid #333; background: #1e1e1e; color: #eee; font-family: 'Courier New', monospace; box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 300px; z-index: 9999;">
    <h3 style="margin-top: 0; text-align: center; color: #e2b714;">MonkeyBot Painel</h3>
    
    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
        <div>
            <label style="font-size: 12px;">WPM Base (Intervalo):</label>
            <input type="range" id="speedSlider" min="0.01" max="0.1" step="0.01" value="0.05" style="width: 100%;">
            <span id="speedValue" style="font-size: 12px; color: #e2b714;">0.05s</span>
        </div>
        
        <div>
            <label style="font-size: 12px;">Taxa de Erros (%):</label>
            <input type="range" id="errorSlider" min="0" max="1" step="0.05" value="0.05" style="width: 100%;">
            <span id="errorValue" style="font-size: 12px; color: #e2b714;">5%</span>
        </div>
    </div>

    <!-- Toggle Único de Estado -->
    <button id="btnToggleBot" data-state="stopped" style="width: 100%; padding: 12px; background: #2a9d8f; border: none; color: white; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 16px; transition: background 0.3s;">
        ▶ INICIAR
    </button>
  </dialog>

  <!-- Botão Flutuante Fallback com Exclusão -->
  <div id="floatingContainer" style="position: fixed; bottom: 20px; right: 20px; z-index: 9998;">
    <span id="btnRemoveFloating" title="Ocultar ícone" style="position: absolute; top: -5px; right: -5px; background: #ff4757; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; font-family: sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10000;">✖</span>
    <div id="btnFloatingMenu" style="background: #e2b714; color: #1e1e1e; padding: 12px 15px; border-radius: 50%; cursor: pointer; font-size: 24px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: transform 0.2s;">
        ⚙️
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', menuHTML);
const modal = document.getElementById('modMenu');
const floatingContainer = document.getElementById('floatingContainer');
const btnFloatingMenu = document.getElementById('btnFloatingMenu');
const btnRemoveFloating = document.getElementById('btnRemoveFloating');
const btnToggleBot = document.getElementById('btnToggleBot');

window.addEventListener('keydown', (event) => {
    if (event.key === 'Insert' || (event.altKey && event.key.toLowerCase() === 'm')) {
        event.preventDefault();
        event.stopPropagation();
        modal.open ? modal.close() : modal.showModal();
    }
}, true);

btnToggleBot.addEventListener('click', () => {
    const isStopped = btnToggleBot.getAttribute('data-state') === 'stopped';
    
    if (isStopped) {
        sendCommand('start');
        btnToggleBot.setAttribute('data-state', 'running');
        btnToggleBot.innerHTML = '⏸ PARAR';
        btnToggleBot.style.background = '#e76f51'; // Vermelho
    } else {
        sendCommand('stop');
        btnToggleBot.setAttribute('data-state', 'stopped');
        btnToggleBot.innerHTML = '▶ INICIAR';
        btnToggleBot.style.background = '#2a9d8f'; // Verde
    }
});

// Ações do Botão Flutuante
btnFloatingMenu.addEventListener('click', () => {
    modal.open ? modal.close() : modal.showModal();
});

btnRemoveFloating.addEventListener('click', (e) => {
    e.stopPropagation();
    floatingContainer.remove();
});

btnFloatingMenu.addEventListener('mouseenter', () => btnFloatingMenu.style.transform = 'scale(1.1)');
btnFloatingMenu.addEventListener('mouseleave', () => btnFloatingMenu.style.transform = 'scale(1)');

document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').innerText = e.target.value + 's';
    sendCommand('update_config', { time_interval: parseFloat(e.target.value) });
});

document.getElementById('errorSlider').addEventListener('input', (e) => {
    document.getElementById('errorValue').innerText = (e.target.value * 100).toFixed(0) + '%';
    sendCommand('update_config', { typos_rate: parseFloat(e.target.value) });
});

async function sendCommand(actionName, payload = {}) {
    try {
        await fetch('http://127.0.0.1:8000/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: actionName, payload: payload })
        });
    } catch (error) {
        console.error("Erro na comunicação com o backend:", error);
    }
}