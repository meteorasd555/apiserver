{
    req:{
        method: "//user",
        page: Number
    },
    res:{
        "  11{  case($req.page == '5'   )}   ":{  // 当符合if条件时用以替代上级对象，只有一个对象合法（一个对象的key如果不全为合法if表达式的话，其他为不合法）
            status: true,
            data: {
                a: 5,
                c: "{{numeric(1, 1000)}}这里可以接字符串",   // 用{{}}括起来的是预制函数名(如果函数中有一个是返回字符串的不会trim空格)
                d: {
                    "{case(req.name == 6)}": 5,
                    e: [
                        "{repeat(2, 3, i)}",  // repeat后的id一个对象做循环, index取值2-3
                        {
                            f: {
                                a: "#{{i}}",  // $符号位类型强转为string
                                b: function(req, i){
                                    return "this is a function()" + req.query.c
                                }
                            }
                        },
                        {              // 如果有第二个对象则在循环最后添加
                            a: function(req) {   // 函数可以直接执行
                                return req.query.c;
                            }   
                        }
                    ]
                }
            }
        },
        "{case($req.page == '1')}":{


        }
    }
}
