const menuHTML = `
  <!-- Botão Nativo Discreto (Gatilho) -->
  <div id="botTriggerContainer" style="position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 998;">
    <button id="btnOpenBot" class="textButton" aria-label="AutoTyper" data-balloon-pos="left">
        <i class="fas fa-terminal"></i>
    </button>
  </div>

  <!-- Modal Furtivo (Herda 100% do design do MonkeyType) -->
  <dialog id="modMenu" class="modalWrapper hidden">
    <div class="modal" style="max-width: 400px; gap: 1.5rem;">
        <div class="title">AutoTyper Config</div>
        
        <div style="display: grid; gap: 1.5rem;">
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: var(--sub-color); margin-bottom: 0.5rem;">
                    <span>WPM Base (Intervalo)</span>
                    <span id="speedValue" style="color: var(--main-color);">0.05s</span>
                </div>
                <!-- Sliders herdam automaticamente o estilo de barra e bolinha do tema -->
                <input type="range" id="speedSlider" min="0.01" max="0.1" step="0.01" value="0.05" style="width: 100%;">
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: var(--sub-color); margin-bottom: 0.5rem;">
                    <span>Taxa de Erros (%)</span>
                    <span id="errorValue" style="color: var(--main-color);">5%</span>
                </div>
                <input type="range" id="errorSlider" min="0" max="1" step="0.05" value="0.05" style="width: 100%;">
            </div>
        </div>

        <!-- Botão Nativo (Usa a classe .button para o botão padrão e .active quando ligado) -->
        <button id="btnToggleBot" class="button" data-state="stopped" style="width: 100%; justify-content: center; padding: 1rem;">
            <i class="fas fa-play"></i> INICIAR
        </button>
    </div>
  </dialog>
`;

document.body.insertAdjacentHTML('beforeend', menuHTML);

const modal = document.getElementById('modMenu');
const btnOpenBot = document.getElementById('btnOpenBot');
const btnToggleBot = document.getElementById('btnToggleBot');

function toggleModal() {
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.showModal();
    } else {
        modal.classList.add('hidden');
        modal.close();
    }
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Insert' || (event.altKey && event.key.toLowerCase() === 'm')) {
        event.preventDefault();
        event.stopPropagation();
        toggleModal();
    }
}, true);

modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal();
});

btnOpenBot.addEventListener('click', toggleModal);

btnToggleBot.addEventListener('click', () => {
    const isStopped = btnToggleBot.getAttribute('data-state') === 'stopped';
    
    if (isStopped) {
        sendCommand('start');
        btnToggleBot.setAttribute('data-state', 'running');
        btnToggleBot.innerHTML = '<i class="fas fa-stop"></i> PARAR';
        btnToggleBot.classList.add('active'); 
    } else {
        sendCommand('stop');
        btnToggleBot.setAttribute('data-state', 'stopped');
        btnToggleBot.innerHTML = '<i class="fas fa-play"></i> INICIAR';
        btnToggleBot.classList.remove('active');
    }
});

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