import { game } from "../../noname.js";

import guojia from "./role/guojia.js";
const custom = [guojia];

game.import("character", function () {
	let base = {
		name: "custom",
		connect: true,
		character: {},
		characterSort: {},
		characterFilter: {},
		characterTitle: {},
		dynamicTranslate: {},
		characterIntro: {},
		characterReplace: {},
		card: {},
		skill: {},
		perfectPair: {},
		translate: {},
		pinyins: {},
	};
	for (let ch of custom) {
		let sk = [];
		for (let k in ch.skills) {
			sk.push(k);
			base.translate[k] = ch.skills[k].name;
			base.translate[k + '_info'] = ch.skills[k].info;
			base.skill[k] = ch.skills[k].handle;
			for (let v in ch.skills[k].voices) {
				base.translate["#" + v] = ch.skills[k].voices[v];
			}
		}
		base.translate["#" + ch.code + ':die'] = ch.voices.die;
		base.character[ch.code] = [ch.sex, ch.org, ch.hp, sk];
		base.translate[ch.code] = ch.name;
		base.characterIntro[ch.code] = ch.intro;
		// TODO
		base.perfectPair[ch.code] = [ch.code];
		console.log(base.character)
	}
	return base;
});
