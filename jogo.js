const spriteFundo = new Image();
spriteFundo.src = "./fundo.jpg";

const spriteNave = new Image();
spriteNave.src = "./SNES - Strike Gunner STG - Players Ship.png";

const spriteTiro = new Image();
spriteTiro.src = "./tiro_nave.png"

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

let estadoTecla = {}

const naveVermelha = {
    padrao: {
        sx: 11,
        sy: 88,
        largura: 29,
        altura: 42
    },

    esquerda1: {
        sx: 345,
        sy: 86,
        largura: 21,
        altura: 41
    },

    esquerda2: {
        sx: 311,
        sy: 86,
        largura: 15,
        altura: 41
    },

    direita1: {
        sx: 70,
        sy: 87,
        largura: 21,
        altura: 41
    },

    direita2: {
        sx: 110,
        sy: 87,
        largura: 15,
        altura: 41
    }
};

class Nave {
    x = 200 - 29 / 2;
    y = 410;
    aceleracao = 0.5;
    velocidadeX = 0;
    velocidadeY = 0;
    velocidadeMax = 6;
    tiro = [];
    intervaloTiro = 100; //Em ms

    constructor(sx, sy, largura, altura) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.tempoUltimoTiro = 0;
    }
    
    desenha() {
        contexto.drawImage(
            spriteNave,
            this.sx, this.sy,
            this.largura, this.altura,
            //fonte
            this.x, this.y,
            this.largura, this.altura,
            );
        }
        
    setSpriteNave({sx, sy, largura, altura}) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
    }

    async movimento(fundo_largura, fundo_altura) {
        if(estadoTecla["d"] || estadoTecla["D"]) {
            if((this.x + this.largura) < fundo_largura) {
                this.velocidadeX += this.aceleracao;
                this.setSpriteNave(naveVermelha.direita1);

                if(this.velocidadeX > 5) {
                    this.setSpriteNave(naveVermelha.direita2);
                }
            } else {
                this.velocidadeX = 0;
            }
        }

        if(estadoTecla["a"] || estadoTecla["A"]) {
            if(this.x > 0) {
                this.velocidadeX -= this.aceleracao;
                this.setSpriteNave(naveVermelha.esquerda1);
                console.log(this.velocidadeX)
                if(this.velocidadeX < -5) {
                    this.setSpriteNave(naveVermelha.esquerda2);
                }
            } else {
                this.velocidadeX = 0;
            }
        } 
        
        if(estadoTecla["w"] || estadoTecla["W"]) {
            if(this.y > 0) {
                this.velocidadeY -= this.aceleracao;
                console.log(this.velocidadeY)
            } else {
                this.velocidadeY = 0;
            }
        }

        if(estadoTecla["s"] || estadoTecla["S"]) {
            if((this.y + this.altura) < fundo_altura) {
                this.velocidadeY += this.aceleracao;
            } else {
                this.velocidadeY = 0;
            }
        } 
         
        if(!((estadoTecla["d"] || estadoTecla["D"]) || (estadoTecla["a"] || estadoTecla["A"]))) {
            this.velocidadeX = 0;
            this.setSpriteNave(naveVermelha.padrao);
        } 
        if(!((estadoTecla["w"] || estadoTecla["W"]) || (estadoTecla["s"] || estadoTecla["S"]))){
            this.velocidadeY = 0;
        }
        
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;

        if(this.velocidadeX > this.velocidadeMax) {
            this.velocidadeX = this.velocidadeMax
        }
        if(this.velocidadeX < -this.velocidadeMax) {
            this.velocidadeX = -this.velocidadeMax
        }
        if(this.velocidadeY > this.velocidadeMax) {
            this.velocidadeY = this.velocidadeMax
        }
        if(this.velocidadeY < -this.velocidadeMax) {
            this.velocidadeY = -this.velocidadeMax
        }
    }

    atirar() {
        if (estadoTecla[" "] && Date.now() - this.tempoUltimoTiro > this.intervaloTiro) {
            this.tiro.push(new TiroNave(68, 237, 12, 12, (this.x + this.largura / 2) - 7, this.y));
            this.tempoUltimoTiro = Date.now();
        }
        for (let i = 0; i < this.tiro.length; i++) {
            this.tiro[i].movimento();
        }
    }
}

class TiroNave {
    velocidadeTiro = 7;

    constructor(sx, sy, largura, altura, x, y) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.x = x;
        this.y = y;
    }

    desenha() {
        contexto.drawImage(
            spriteTiro,
            this.sx, this.sy,
            this.largura, this.altura,
            //fonte
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    movimento() {
        this.y -= this.velocidadeTiro;
    }
}
            
class PlanoFundo {
    x = 0;
    y = 0;
    largura = canvas.width;
    altura = canvas.height;
    velocidadeMovimento = 2;
    
    desenha() {
        contexto.drawImage(
            spriteFundo,
            this.x, (this.y - this.altura),
            this.largura, this.altura,
        );

        contexto.drawImage(
            spriteFundo,
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    atualiza() {
        let movimentacao = this.y + this.velocidadeMovimento;
        this.y = movimentacao % this.altura;
    }
}

class Telas {
    constructor(tela) {
        this.tela = tela;
        if(tela == "JOGO") {
            this.fundo = new PlanoFundo();
            this.nave = new Nave(11, 88, 29, 42);
        }
    }
    
    desenha() {
        if(this.tela == "JOGO") {
            this.fundo.desenha();
            this.fundo.atualiza();
            this.nave.desenha();
            
            console.log(this.nave.tiro.length);
            for(let i = 0; i < this.nave.tiro.length; i++) {
                this.nave.tiro[i].desenha();
            }
        }
    }

    atualiza() {
        if(this.tela == "JOGO") {
            this.nave.movimento(this.fundo.largura, this.fundo.altura);
            this.nave.atirar();
        }
    }
}


telaAtiva = new Telas("JOGO");

window.addEventListener('keydown', (event) => {
    estadoTecla[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    estadoTecla[event.key] = false;
});

function runGame() {
    
    telaAtiva.desenha();
    telaAtiva.atualiza();
        
    requestAnimationFrame(runGame);
}

runGame();
