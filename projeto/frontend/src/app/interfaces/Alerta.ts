export class Alerta {
	constructor(public tipo: string, public mensagem: string) {}

	equals(other: Alerta): boolean {
		let retorno =  (this.tipo === other.tipo && this.mensagem === other.mensagem);
		console.log('retorno', retorno);
		return retorno;
	}
	
	hashCode(): number {
		let hash = 5381;
		const str = this.tipo + this.mensagem;
		for (let i = 0; i < str.length; i++) {
		  hash = (hash * 33) ^ str.charCodeAt(i);
		}
		console.log('has', hash >>> 0);
		return hash >>> 0;
	}
}