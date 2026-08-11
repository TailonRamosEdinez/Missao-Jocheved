// media.js - behavior for the top menu and dynamic video rendering
const SUPABASE_URL = 'https://eskpkyazsltyvrlufmrs.supabase.co';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1/videos`;
const SUPABASE_ANON_KEY = (window.MissaoJochevedSupabaseConfig && window.MissaoJochevedSupabaseConfig.anonKey) || '';

const SECTION_LABELS = {
	ensino: 'Ensino',
	testemunho: 'Testemunho',
	beleza: 'Beleza Divina'
};

const SECTION_CATEGORY_LABELS = {
	ensino: 'Categoria de Ensino',
	testemunho: 'Categoria de Testemunho',
	beleza: 'Categoria de Beleza Divina'
};

const SECTION_CATEGORY_ALIASES = {
	ensino: ['ensino', 'lado do bem', 'estudo', 'estudos', 'teologia', 'reflexao', 'reflexões', 'judeo', 'visoes', 'visões', 'judeo com visoes diferentes'],
	testemunho: ['testemunho', 'histórias de fé', 'historias de fe', 'historia de fe'],
	beleza: ['beleza', 'beleza divina', 'contemplação', 'contemplacao']
};

document.addEventListener('DOMContentLoaded', () => {
	const buttons = document.querySelectorAll('.menu-btn');
	const panels = document.querySelectorAll('.conteudo');
	const indicator = document.querySelector('.menu-indicator');
	const videoCategoriesContainer = document.querySelector('.video-categories');
	const videoResultsTitle = document.querySelector('#video-results h3');
	const videoResultsText = document.querySelector('#video-results p');
	const videoList = document.querySelector('.video-list');
	let catalogBySection = {};

	function normalizeText(value) {
		return String(value || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function matchesSection(category, sectionId) {
		const aliases = SECTION_CATEGORY_ALIASES[sectionId] || [];
		const normalizedCategory = normalizeText(category);
		return aliases.some(alias => normalizeText(alias) === normalizedCategory) || normalizedCategory === normalizeText(sectionId);
	}

	function getYouTubeEmbedUrl(video) {
		const rawValue = video?.youtube_id || '';
		const match = rawValue.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
		if (match) {
			return `https://www.youtube.com/embed/${match[1]}`;
		}
		return rawValue ? `https://www.youtube.com/embed/${rawValue}` : '';
	}

	function buildCategoryButtons(sectionId, videos) {
		if (!videoCategoriesContainer) return;

		const filteredVideos = (videos || []).filter(video => matchesSection(video.category, sectionId));
		const categories = [];
		const seen = new Set();

		filteredVideos.forEach(video => {
			const categoryName = video.category || 'Sem categoria';
			if (seen.has(categoryName)) return;
			seen.add(categoryName);
			categories.push({
				name: categoryName,
				slug: normalizeText(categoryName).replace(/\s+/g, '-'),
				videos: filteredVideos.filter(item => (item.category || 'Sem categoria') === categoryName)
			});
		});

		const normalized = categories.length ? categories : [{
			name: 'Sem categoria',
			slug: 'sem-categoria',
			videos: []
		}];

		catalogBySection[sectionId] = {
			sectionId,
			title: SECTION_LABELS[sectionId] || sectionId,
			categories: normalized
		};

		videoCategoriesContainer.innerHTML = '';
		normalized.forEach((category, index) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = `video-category${index === 0 ? ' active' : ''}`;
			button.dataset.section = sectionId;
			button.dataset.category = category.slug;
			button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
			button.textContent = category.name;
			button.addEventListener('click', () => renderVideos(sectionId, category.slug));
			videoCategoriesContainer.appendChild(button);
		});

		const firstCategory = normalized[0];
		if (firstCategory) {
			renderVideos(sectionId, firstCategory.slug);
		}
	}

	function renderVideos(sectionId, categorySlug) {
		const sectionData = catalogBySection[sectionId];
		const category = sectionData?.categories?.find(item => item.slug === categorySlug) || sectionData?.categories?.[0];

		if (!videoCategoriesContainer || !videoList || !sectionData || !category) {
			return;
		}

		const buttons = videoCategoriesContainer.querySelectorAll('.video-category');
		buttons.forEach(button => {
			const isActive = button.dataset.category === category.slug;
			button.classList.toggle('active', isActive);
			button.setAttribute('aria-selected', isActive ? 'true' : 'false');
		});

		if (videoResultsTitle) {
			videoResultsTitle.textContent = category.name;
		}

		if (videoResultsText) {
			videoResultsText.textContent = `${SECTION_CATEGORY_LABELS[sectionId] || 'Categoria'} · ${category.videos?.length ? `${category.videos.length} vídeo(s)` : 'Nenhum vídeo ainda'}`;
		}

		videoList.innerHTML = '';

		if (!category.videos?.length) {
			videoList.innerHTML = '<div class="video-empty">Ainda não há vídeos cadastrados para esta categoria.</div>';
			return;
		}

		const fragment = document.createDocumentFragment();
		category.videos.forEach(video => {
			const card = document.createElement('article');
			card.className = 'video-card';
			const embedUrl = getYouTubeEmbedUrl(video);
			card.innerHTML = `
				<div class="video-frame">
					${embedUrl ? `<iframe src="${embedUrl}" title="${video.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>` : '<div class="video-empty">Vídeo indisponível</div>'}
				</div>
				<div class="video-card-content">
					<h4>${video.title}</h4>
					<p>${video.description || 'Vídeo vinculado à categoria selecionada.'}</p>
				</div>
			`;
			fragment.appendChild(card);
		});

		videoList.appendChild(fragment);
	}

	async function loadVideosFromSupabase(sectionId) {
		const headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		};

		if (SUPABASE_ANON_KEY) {
			headers['apikey'] = SUPABASE_ANON_KEY;
			headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
		}

		try {
			const response = await fetch(`${SUPABASE_REST_URL}?select=title,youtube_id,description,category&order=created_at.desc`, {
				method: 'GET',
				headers
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const videos = await response.json();
			buildCategoryButtons(sectionId, videos);
		} catch (error) {
			console.error('Erro ao carregar vídeos do Supabase:', error);
			if (videoList) {
				videoList.innerHTML = '<div class="video-empty">Não foi possível carregar os vídeos do Supabase. Verifique a chave anônima e a política de leitura da tabela videos.</div>';
			}
		}
	}

	function activate(id) {
		panels.forEach(p => p.classList.remove('ativo'));
		buttons.forEach(b => b.classList.remove('active'));
		const panel = document.getElementById(id);
		const btn = document.querySelector(`.menu-btn[data-target="${id}"]`);
		if (panel) {
			panel.classList.add('ativo');
			panel.removeAttribute('hidden');
		}
		panels.forEach(p => { if (p.id !== id) p.setAttribute('hidden', ''); });
		if (btn) {
			btn.classList.add('active');
			btn.setAttribute('aria-selected', 'true');
			const idx = Array.from(buttons).indexOf(btn);
			if (indicator) indicator.style.transform = `translateX(${idx * 100}%)`;
		}
		buttons.forEach(b => { if (b.dataset.target !== id) b.setAttribute('aria-selected', 'false'); });
		loadVideosFromSupabase(id);
	}

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.target;
			activate(target);
		});
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				const target = btn.dataset.target;
				activate(target);
			}
			if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
				e.preventDefault();
				const idx = Array.from(buttons).indexOf(btn);
				const dir = e.key === 'ArrowRight' ? 1 : -1;
				const nxt = buttons[(idx + dir + buttons.length) % buttons.length];
				nxt.focus();
				activate(nxt.dataset.target);
			}
		});
	});

	const first = buttons[0]?.dataset.target || 'ensino';
	activate(first);
});

	const first = buttons[0]?.dataset.target || 'ensino';
	activate(first);
});
