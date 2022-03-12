import random
import string


def get_random_string(length=10):
    """
    Generate a random string of fixed length.
    """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))