from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from config import BotConfig
from MonkeyBot import MonkeyBot

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.config = BotConfig()
    app.state.bot = MonkeyBot(app.state.config)
    
    app.state.bot.open_and_inject()
    yield
    
    try:
        app.state.bot.driver.quit()
        print("[!] Navegador encerrado.")
    except Exception as e:
        print(f"[!] Erro ao encerrar navegador: {e}")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandPayload(BaseModel):
    action: str
    payload: dict = {}

@app.post("/api/command")
def receive_command(data: CommandPayload):
    bot = app.state.bot
    config = app.state.config

    match data.action:
        case "start":
            bot.start_typing()
            print("[+] Comando: Iniciando digitação")
            return {"status": "success", "action": "start"}
            
        case "stop":
            bot.stop_typing()
            print("[-] Comando: Parando digitação")
            return {"status": "success", "action": "stop"}
            
        case "update_config":
            updated_keys = []
            for key, value in data.payload.items():
                if hasattr(config, key):
                    setattr(config, key, value)
                    updated_keys.append(key)
            print(f"[*] Configuração atualizada: {updated_keys}")
            return {"status": "success", "updated": updated_keys}
            
        case _:
            raise HTTPException(status_code=400, detail="Invalid action command.")

if __name__ == "__main__":
    print("[!] Subindo servidor local. Não feche este terminal.")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")