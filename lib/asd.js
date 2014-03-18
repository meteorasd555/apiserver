// 普通情况
{
    req: {
        param1: Number
        param2: String,
        param3: true
    },
    resp: {
        status:1
        data: {
            val1: [],
            val2: {

            },
            val4: "返回值",
            val5: 5
        }

    }
}

// 参数决定情况
{if req.param1 == "user/info"}
{
    req: {
        api: String
        param1: Number,
        param2: Boolean
    },
    resp: {
        status:1
        data: {
            val1: [1,2,3,4,5],
            val2: {
                age: 15, 
                gender: 1, 
                name: "Tom"
            },
            val3: {loop: req.param1}         // 循环， i是默认自增, 从1开始
                       {
                          id: #{i},
                          label: "name" + #{i},             // 每项数据都自增
                          label2: "adress" + #{r(1,10)}     // 每项数据都随机                   
                       }
                  {/loop}
            val4: {fn}                      // 可以是任何javascript代码, 随便你怎么玩~
                      function(req) {       // req会传入请求对象
                        var i, ret = [];
                        for(i = 0;i < 10; i++) {
                            ret.push({
                                req.param2   // 根据传入参数而定
                            })
                        }
                        return ret;
                      }
                  {/fn}
        }

    }
}
{/if}