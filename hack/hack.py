import lief

libnative = lief.parse("libsecsdk.old.so")
libnative.add_library("libhack.so")  # Injection!
libnative.write("libsecsdk.so")