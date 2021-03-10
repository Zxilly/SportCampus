import os
import traceback

import mysports.login as login_module
from mysports.no_free_run import no_free_run


# 主函数的登陆模块
def login(account, pwd, type):
    global userid, session, school
    try:
        print('正在登陆')
        userid, session, school = login_module.login(account, pwd, type)
    except Exception as e:
        traceback.print_exc()
        print('登陆失败')

    print('登陆成功')

    try:
        print('<MainModule>：正在尝试进行体育锻炼')
        print(session.headers)

        dis = no_free_run(userid, session, school=school, rg=(1, 2), debug=False)
        print('<MainModule>：成功体育锻炼： %s km !\n' % dis)
    except Exception as e:
        traceback.print_exc()
        print('<MainModule>：体育锻炼失败')


# def run(account, password, rg=(2, 4), debug=True):
#     try:
#         print('try login...')
#         userid, s, school = login(account, password)
#     except Exception as e:
#         traceback.print_exc()
#         print('login failed')
#
#     print('loging successfully')
#
# try:
#     print('try run...')
#     dis = no_free_run(userid, s, school=school, rg=rg, debug=debug)
#     print('run %s km successfully !\n' % dis)
# except Exception as e:
#     traceback.print_exc()
#     print('run failed')

# 主函数入口
if __name__ == '__main__':
    # 调用登陆方法

    # run(mobile, password, rg=(args.red, args.green), debug=args.debug)
    if os.getenv('CI'):
        mobile = os.getenv('MOBILE')
        password = os.getenv('PASSWORD')
        login(mobile, password, "iPhone 7")
    else:
        import sec

        login(sec.mobile, sec.password, "iPhone 7")
