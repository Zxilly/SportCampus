import json
import uuid
import mysports.utils as utils

import requests

from mysports.original_json import headers, host
from mysports.sports import get_md5_code


def login(mobile, psd):
    # 生成 uuid
    headers['uuid'] = str(uuid.uuid1()).upper().replace('-', '')
    # aaid = f"48f2f2a8-{utils.get_random_string(4)}-42e2-b0a9-ff20053ed9a1"
    # oaid = f"53a31{utils.get_random_string(4)}e9bc521"
    # vaid = f"2d45d{utils.get_random_string(4)}cc07511"
    aaid = "48f2f2a8-1e1e-42e2-b0a9-ff20053ed9a1"
    oaid = "53a318859e9bc521"
    vaid = "2d45d5851cc07511"

    # 启动 session
    s = requests.Session()

    # 设置请求头
    s.headers = headers
    print('<LoginModule>：header 请求头为：', s.headers)

    # POST 所需要的 data 数据
    login_data = json.dumps(
        {"info": headers['uuid'], "mobile": mobile, "password": psd, "type": 'M2102J2SC', "aaid": aaid, "oaid": oaid,
         "vaid": vaid})
    print('<LoginModule>：请求数据:', login_data)
    print('<LoginModule>：登陆接口处md5加密:', get_md5_code(login_data))
    print('<LoginModule>：准备发起请求')
    params = {'sign': get_md5_code(login_data), 'data': login_data}
    print(params)
    login_res = s.get(host + '/api/reg/login',
                      params={'sign': get_md5_code(login_data), 'data': login_data, 'ltype': 1})
    print('<LoginModule>：发起请求成功')
    print('<LoginModule>：正在处理数据')
    # convert to JSON
    login_rd = login_res.json()
    # catch login failed
    print('<LoginModule>：接口返回的信息:', login_rd)

    try:
        userid = login_rd['data']['userid']
        utoken = login_rd['data']['utoken']
        school = login_rd['data']['school']
    except:
        print(login_rd)
        raise Exception

    s.headers.update({'utoken': utoken})

    return userid, s, school
