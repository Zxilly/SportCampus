import random
import string

import frida

from mysports.hook import script


def get_random_string(length=10):
    """
    Generate a random string of fixed length.
    """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))


tokens = []


def set_token(tk):
    tokens.append(tk)


def get_token():
    # return tokens.pop(0)
    return ""


def frida_task():
    def on_message(message, data):
        if message['type'] == 'send':
            print(f"get {message['payload']}")
            set_token(message['payload'])

    device = frida.get_device_manager().get_usb_device()
    process = device.attach('高校体育')
    scr = process.create_script(script)
    scr.on('message', on_message)
    scr.load()

    while True:
        if len(tokens) >= 2:
            print('have enough tokens')
            break
