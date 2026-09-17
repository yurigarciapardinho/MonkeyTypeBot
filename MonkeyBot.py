import time
import random
import threading
import os
from config import BotConfig
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

class MonkeyBot:
    def __init__(self, config: BotConfig):
        self.config = config
        self.is_running = False
        self.type_thread = None
        
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=chrome_options, service=Service(ChromeDriverManager().install()))
        
    def open_and_inject(self):
        self.driver.get('https://monkeytype.com/')
        
        try:
            wait = WebDriverWait(self.driver, 5)
            cookie_xpath = '//div[@id="cookiesModal"]//button[contains(text(), "accept") or contains(text(), "Accept")]'
            cookie_button = wait.until(EC.element_to_be_clickable((By.XPATH, cookie_xpath)))
            self.driver.execute_script('arguments[0].click()', cookie_button)
        except:
            pass

        # MOd Menu
        js_path = os.path.join(os.path.dirname(__file__), 'frontend', 'mod_menu.js')
        with open(js_path, 'r', encoding='utf-8') as f:
            js_code = f.read()
            self.driver.execute_script(js_code)
            
        print("[+] Mod Menu injetado. Use Ctrl+Shift+M no navegador.")

    def start_typing(self):
        if self.is_running: return
        self.is_running = True
        self.driver.find_element(By.TAG_NAME, 'body').click()
        
        # Mantenho a digitação em uma thread paralela para não bloquear a API
        self.type_thread = threading.Thread(target=self._typing_loop, daemon=True)
        self.type_thread.start()

    def stop_typing(self):
        self.is_running = False

    def _type_word(self, word: str):
        actions = ActionChains(self.driver)
        if random.random() > (1 - self.config.typos_rate):
            error_word = random.choice(self.config.error_words)
            actions.send_keys(error_word).pause(0.15)
            for _ in error_word:
                actions.send_keys('\ue003').pause(0.05)
        
        for char in word + " ":
            noise = self.config.time_interval + random.uniform(-self.config.time_err, self.config.time_err)
            actions.send_keys(char).pause(max(0, noise))
        actions.perform()

    def _typing_loop(self):
        start_time = time.time()
        while self.is_running and (time.time() - start_time < self.config.time_control):
            try:
                active_word_element = WebDriverWait(self.driver, 1).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".word.active"))
                )
                self._type_word(active_word_element.text)
            except TimeoutException:
                break
        self.is_running = False