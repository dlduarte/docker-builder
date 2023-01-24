const {app, Tray, Menu, BrowserWindow, ipcMain, nativeImage} = require('electron')
const {createProtocol} = require('vue-cli-plugin-electron-builder/lib');
const path = require('path')

const {findBuilder, listBuilders, removeBuilder, saveBuilder} = require('@/backend/builder');
const {publishImage} = require('@/backend/cmd');
const {configure, isConfigured} = require("@/utilities/configure-app");
import notification from "@/backend/notification";

let tray;
let mainWindow;
let nativeIcon = nativeImage.createFromDataURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAABGdBTUEAALGPC/xhBQAACklpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAAEiJnVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/stRzjPAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAMUExURQAAAP///xaR8////2VfB3YAAAAEdFJOU////wBAKqn0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAPJElEQVR4nO2d24KruA4Fzezz/7+c89DdCUkM+C6JVfUyuydcrUI2YOztXwJl/rM+ALAFAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBx/md9ACt51C2+zTkKXwgJUBn+lB4KClAFiKMjQHUCaFwnGDoCQBYEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRDgDIaKvRECwWxBRwDIIjRa+MZw8RmEBBCJaCVUAeIggDgIIA4CiIMA4iCAOAggDgKIs/xBUO1EXO8Pb5auLfHcaHUGaJi9cdTaj9q1q1eIyGIBGor0kf3nxB1qodMGQIUsOgK0ICANAoiDAOIggDgIIA4CiIMA4iCAOAggDgK4Yv3rBwTwxGO9AgjgjrUKIIAjHh//XQEC+OEV94VJAAHc0Nf1pRUEcMqqJIAAXvgK+BoDEMAJmXAvSQII4JkFBiCADw5CPd8ABPDNdAMQwAXHcZ5tAAJ4Z7IBCOCB0yDPNQAB/DPVAARwwFWEZxqAABGYaAAC2FMQ3nkGIEAMphmAAOaUxXaWAQgQhUkGIIA1xYGdYwACiIMAcZiSAhDAmJqozjAAASIxwQAEEAcBbKm8psenAASIxXADEEAcBDhj+mjB9Rf06BSgI4DE0M/1LBagIQpb9p8Tdzho5VkMTgGrM0B1mb6tsNWuvl++a+U5OBiKdvtnfQTKtAkwVEydNgBkQYB4DK04EMAQB00ABIjISHEQQBwEiMjAFIAA4iCAOC0TR3bN3mg4cWR14hx44Dk6Evlj2MOghgzQN3tj197W7rrzwD3c5F1TL0DX7I1hJ46MEc0GdNoALSH0G/ZhR6YjAGRBAHEQICij6gAEEAcBxEEAcRBAHASIyqBWYMu7APDEsQhF7wsQICyXKeBngQsNEODuPFI6swABJHgcOoAAKhw4gABC5BzgNlCLr24qCKDGhwIIoMebAgigyE4BBLDDcvyJpwEIIMqfAQigyq8BCCDLT0MAAYR5JAQwxcMoZAggzJYQQB4EEAcBLLFtBGwpIYA8CCDLT/pBAFPsbwQRQBwEUOU3+SCALeZ1AAKI8mceAhhjnQIQQJOndwggDgJYY1IHvHaKAIrspEOAM5ZcnbbNwFACGE4CODNKyw3Y77BegK7ZG1dP/dg37aRfZ7p4n4qxZd7AuuFpPgqia2XLtSsH5amJ/9Ixid8PjIkjPWAoAOMD2LN2TPKPzIQA1iwekv6zZkIAU5ZPSPDVMkEAOwymo/humSKAESaTkWTuTBDAAKuZaBglzB7LWYiyTyYQYBH280/ln0xlBLA/VJhA4UihRP+mHD2Z/ngZRPxvyuGbibcMQPhvysmLqX0GIP435ezF5E4A4n9TTl9Mv6oA4n9PmDFEmstuKc8qgARwR667JZEBbkxJr7Q/AUgAt6OsUyIZ4KaU9klFgFtS3iUZAe5H1QcJvwLQBLgLtZ+jkAHuRMPHSAhwFxq/REOAG9DzFSICBGbE56cIEIvhnxz/N2m7EIRQA0TA+AsVAcRBAHEQIBITmmoIIA4CBGLGvRoCiIMAcZjysAYBxEEAcRAgDHMe1yOAOAgQhUnv6xBAHAQIwqwX9gggDj2Cqji6DuN2q0eAYs6S8JYmSzCtyxZVQCmXIdhC9qtDgDKKojvPgHlb/hMgpL3rKCyegKVIG6CEV2DzFf3z921OQ2CiWFQBBVzFf/e/w+UABLjmGdTH4fX9+mWGATOtQoByTtN71CcBCHDJ3/V3EeK/n8dfrlOrFQS4ojD+UXMAAhRSEN7fRUZfsHPblQhQRszLuwAEGMgUSybfWD4FCHcDu4ifcqkKbaiiJAOMZEIKmG0TAoiDAOIggG+mtycQQBzt18H762v+nX7D3ubfULwEmPQq2zHbx19zC2Dt3orRzQDfF9fMoLTtbcETBdk2QLZsZxV4vkfhdTfT8UfyhaoAB2U7p2fv0UY9PDLUFOAkzhOCcrKz070t8UOyDbAr2e9uHO+N4QFBqNibAf9eKcBDQlpCvo/n9v3z5x+lm85vIS/W0lyUQbAKOOjjme3X+fvPjss0H38//Yj1BDiIyP5/tMfkq1PQ4d4u+xEvEkNOgOP47w3YPhZu3MtWtrfWvYxg+/f6t3V7ZAVnEUlHsagomINgXuwt8/MqK/YZQKAVeBH//msgv4GrvRmWvFYVcBX//A9VVlRt4NiAZUpICXAd/9xPk7LC+08fAV+XEpQEKIl/prleuZevDwjL9mZVCwgJUBb/r8cD9Ts6eLxwsfDegIU2/JNpBZbGf79wc/Yv/p4s5Up9ZRz+yaSAmpis5euhw0oBiL89n6+IlibidwHuWwc4jv/ML8uvkckAP7iM/9GLwiWICND/Vm8uuwNbnAZEBAiCQR3wIcB9GwEpOU4AO1ZHgAzgAzM3NfoEhkls6w9UKQNEqAGW8ylAmGvlbljZqZQBIAMCiPMlAHWADfQHmA9uZ9AQgPb/IRoCwCHfAtw4UTo+NbNDIwOIIyLApIG8h2F3YBkB3JbSAJyeG18GTcey19UllgeVE8BlIfXi2ADTQ1LJAC/cGWB7QDoCmH+EdYDx4ezHB3hxzydnVd8GFW1o8LYs0OgR9MPj+eVFe9Ty33EP3N5qlAToNuAwWlurA+bxP2gD2B/XHHry9XYxqmNLmTkoZ51GYEqp42awIL4XhjhFTIBGSkMb0IADAQKeSRktlUDFlV2XBDyUslQjsI3PMH06tH38Fese+miACA9yzqH2zIpu+tvGd/FQyGSAcwqf+TzeBviIlAMOG4Ee7JxB3Xntli4e7SlW2XEXcMY+/pcL7wwJdEN4LECcc6ihsZV+dfn/LlW5Hw9VhVgGaI1/4RplnrjiRIAbpoCWsQILl/5cNEoKuPtdwACL66L0eA775yC6BZxVAeFTwOHT+ZoEUB3HmvcN9pLcuA1w3BRvG8C1mJqomhtwXwGOI1gV/xHzRZ1hbcCpAJHrgOPLv3v+h+KVIhhwPlh0WAMO03/ltO2t0aksOMNyvvtdQN8V1t3js3AD74st1eFiuPigKaC3Bu8/7a8h4FcfQCm3bAQ+E3jnFdyxut2eK7kSIGgKSCn1z/dh2Txbtu87ZgAH8ev/IH3V0V8KEDYFdH+sYXx/tmj31xkgnAFODtj7mBS/3LEKSCnNne5xDWsOoEAA7w6PZtT5mhtUxF0zQIzSP2fJOZQIECsFDDraYaXvvPSKMoDzc4AO7loFeCBENVQmgFIKUDrXVJwBxEpFCKqAPAPTt++Lp1QA32cBzRRnAAy4J+VVAAbUEqLEaANMI0T8awSIcUJuCFJcNRkgyCm5IMwH4lVVQJSTsidOSdW1AeKcly2ByqmyERjozOwIk/5T4i7giI4YXg0r54taASLJbUKoyz81ZIBg57eacMVTXwWEO8VK+kYUH3YYq2hoA8Q7yVVELJmWRmCE8+w+xvoNBLz8U+NdgOsztWp0d45IYEXbbaBrA3pp+qRnxuW/pJQbnwP4N2DpEU7J/mvOoPVBkH8DFnJWGM5rgPYngX6bPN1fZVZuYFJJLCrfjkfBbg34Zc3xzboQVpVuz7sArwZ0zxNdngIuw79omLF2ul4GuTdg8gHO236UQaK8GvCkMURlKaBg243ziS4s185xAp3OkfV4leB7WVYe7dk4f0ODZHcl5WcPr8GlAWdDxdasXjRN2DFV+7KhXwCvCowZLDq/bGHIigrGuBod0SPIZ0vguPRrBvLPLTu0irYuvBEZIIVLAj05oDxik6clGMMgAZwacFjArQbUxCtE/IeNFu70duD9qNqK+3UrULW+z/L4YlQGSCnEKVcNI/6+cK09MRLA0G7hDk7nirbZQratvuEX4GpIKQ3+LsDvG8InjfPFVJ9YhDvAlNLwD0MCKFBD82Uc5fqf8GWQdwVqp4Fs2kec+M+YM2iLdAFc8WjI06HOfs63gd7TQA3NM4fGYNbHoW4VmH1BR0r/Kc2cNu4+NUFNNRDulKd+Hn44ebMdXR1Erpdb0cQcy+yJI509Ij5/y3vMo0QdV2dayvyZQ7fkp2h6EtJVRdByjg/7DDnyXcApHhyoehNwvoV3umcos2PZ3MEOEkF//LNVgQe121mWAX4xLK0B8Z+BcQ5YPXv4lpJ1BHzF37odYDJ9vEl10HoDMB1bA0wESGl9KnAbf2MDzARIKf1FZUVMHMff1gBbAX64+ghj0Pan7qMPQwM8CPDL8Iv0u1Sdxt8SRwL88YpbS7zMn6w0YZcCHArwYnSpkAC+YbBoH5i5iQDiKAlADZBBSQDIgADiIIA4CCCOkgAxnxFNRkkAyIAAPjDLTlICUAd8IyUAfKMlgNsUYHdgWgJ4NcDwsMQE8GmA5UGpCeDRAM1ewWacjQC+WyqlrteHFd1dbZVc/WWQBy7D0t2LtKZXm3FKUhTgKipdUwzUrm9dJcm1AVK6KvTt9M/qrVftbD2SApwV+/egJpUxqlrfPP6iAhwXfHZ+gM4tH69vH39VAY6Kvjsi2Q0cbdVB/GUFqIrUHC1cxF9XgLpcPWFnPuIvLEBda611m8c/+Ii/sgDd93t1O9vO/rRD71Hwjv0ghvMDsnZvpUgL8DdYzapwbCk9NgdjA+4RFyClxVfj5ujiTylptwEgIYA8CCAOAoiDAOIggDgIUIKzW7eRIIA4CCAOAowkYFWBAEUEjGwhCCAOApRRlAIi5gkEGEfE+CNAKdfRDRl/BCjmKr4x448A5Zx34wsaf3oE1XA8EXLU8CNAJXkF4oYfAaqJHOwctAHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBAHAcRBAHEQQBwEEAcBxEEAcRBAHAQQBwHEQQBxEEAcBBDn/zvS4Y5q8NweAAAAAElFTkSuQmCC");

app.whenReady().then(async () => {
    if (app.requestSingleInstanceLock()) {
        app.on('second-instance', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                } else {
                    mainWindow.show();
                }

                mainWindow.focus();
            }
        })

        await createWindow();
        createTray();
    } else {
        app.quit();
    }
})

async function createWindow() {

    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        resizable: false,
        autoHideMenuBar: true,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        }
    });

    mainWindow.on('ready-to-show', function () {
        mainWindow.openDevTools();
    })

    mainWindow.setTitle("Docker Builder");
    mainWindow.setIcon(nativeIcon);

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    });

    ipcMain.handle('notify', notification)
    ipcMain.handle('is-configured', isConfigured)
    ipcMain.on('configure', configure)

    ipcMain.handle('list-builders', listBuilders)
    ipcMain.handle('get-builder', findBuilder)
    ipcMain.on('save-builders', saveBuilder)
    ipcMain.on('remove-builders', removeBuilder)

    ipcMain.on('publish-docker-image', publishImage)

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    } else {
        createProtocol('app')
        mainWindow.loadURL('app://./index.html')
    }
}

function createTray() {
    tray = new Tray(nativeIcon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Abrir Docker Builder',
            click() {
                mainWindow.show();
                mainWindow.focus();
            }
        },
        {
            label: 'Sair',
            click() {
                app.isQuiting = true;
                app.quit();
            }
        }
    ])

    tray.setToolTip('Docker Builder')
    tray.setContextMenu(contextMenu)
}