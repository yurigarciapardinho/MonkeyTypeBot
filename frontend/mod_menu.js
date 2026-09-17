const menuHTML = `
  <dialog id="modMenu" style="padding: 20px; border-radius: 8px; border: 1px solid #333; background: #1e1e1e; color: #eee; font-family: 'Courier New', monospace; box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 300px;">
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

    <div style="display: flex; justify-content: space-between; gap: 10px;">
        <button id="btnStart" style="flex: 1; padding: 10px; background: #2a9d8f; border: none; color: white; cursor: pointer; border-radius: 4px; font-weight: bold;">INICIAR</button>
        <button id="btnStop" style="flex: 1; padding: 10px; background: #e76f51; border: none; color: white; cursor: pointer; border-radius: 4px; font-weight: bold;">PARAR</button>
    </div>
  </dialog>
`;

document.body.insertAdjacentHTML('beforeend', menuHTML);
const modal = document.getElementById('modMenu');

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        modal.open ? modal.close() : modal.showModal();
    }
});

// Atualiza os valores visuais e envia a nova configuração para a API
document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').innerText = e.target.value + 's';
    sendCommand('update_config', { time_interval: parseFloat(e.target.value) });
});

document.getElementById('errorSlider').addEventListener('input', (e) => {
    document.getElementById('errorValue').innerText = (e.target.value * 100).toFixed(0) + '%';
    sendCommand('update_config', { typos_rate: parseFloat(e.target.value) });
});

document.getElementById('btnStart').addEventListener('click', () => sendCommand('start'));
document.getElementById('btnStop').addEventListener('click', () => sendCommand('stop'));

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