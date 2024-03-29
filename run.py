import sys
import os
import traceback

import mysports.login as login_module
from mysports.no_free_run import no_free_run
from mysports.utils import frida_task


# 主函数的登陆模块
def login(account, pwd):
    global userid, session, school
    try:
        print('正在登陆')
        userid, session, school = login_module.login(account, pwd)
    except Exception as e:
        traceback.print_exc()
        print('登陆失败')

    print('登陆成功')

    try:
        print('<MainModule>：正在尝试进行体育锻炼')
        print(session.headers)

        dis = no_free_run(userid, session, school=school, rg=(1, 2), debug=True)
        print('<MainModule>：成功体育锻炼： %s km !\n' % dis)
    except Exception as e:
        traceback.print_exc()
        print('<MainModule>：体育锻炼失败')


# 主函数入口
if __name__ == '__main__':
    try:
        # frida_task()
        login(sys.argv[1], sys.argv[2])
    except IndexError:
        print('run.py <mobile> <password>')
