function createMark(mark, alpha = 1) {
	const textStyle = {
		stroke: 0x000000,
		strokeThickness: 5,
		fill: 0xffffff,
		dropShadowColor: 0,
		dropShadowAlpha: 0,
		fontWeight: 400,
		fontFamily: 'Font Awesome 6 Pro',
		fontSize: '3em/1',
	};

	const style = PreciseText.getTextStyle({ ...textStyle });
	const text = new PreciseText(mark, style);
	text.visible = false;
	text.alpha = alpha;

	// Configure anchor point
	text.anchor.set(0.5, 1);

	return text;
}

const marks = {
	currentTurn: createMark('\uf13a'),
	nextTurn: createMark('\uf13a', 0.5),
};

function applyMark(token, mark) {
	if (mark.destroyed) {
		for (const [key, value] of Object.entries(marks)) {
			if (mark === value) {
				marks[key] = mark = createMark(mark.text, mark.alpha);
				break;
			}
		}
	}
	if (token.object && !token.hidden) {
		mark.visible = true;
		mark.setParent(token.object);
		const width = token.width * canvas.scene.dimensions.size;
		mark.x = width / 2;
		mark.y = -10;
		return;
	}
	removeMark(mark);
}

function removeMark(mark) {
	mark.visible = false;
	if (mark.parent) mark.parent.removeChild(mark);
}

export function applyMarks(token1, token2) {
	applyMark(token1, marks.currentTurn);
	if (token2 !== token1) applyMark(token2, marks.nextTurn);
}

export function removeMarks() {
	for (const mark of Object.values(marks)) removeMark(mark);
}

Hooks.once('ready', () =>
	setTimeout(() => {
		for (const mark of Object.values(marks)) mark.updateText();
	}, 5000)
);
