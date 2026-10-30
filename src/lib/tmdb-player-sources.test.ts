import {
  buildTmdbPlayerPageUrl,
  buildTmdbProviderUrl,
  getTmdbPlayerSandbox,
  normalizePositiveInteger,
  normalizeTmdbId,
  normalizeTmdbPlayerProvider,
} from './tmdb-player-sources';

describe('TMDB player path parameters', () => {
  test.each([
    [
      'vidsrc',
      'https://vidsrc.tw',
      '/embed/movie/550',
      '/embed/tv/63247/2/1',
    ],
    ['vidlink', 'https://vidlink.pro', '/movie/550', '/tv/63247/2/1'],
    ['vidlux', 'https://vidlux.xyz', '/embed/movie/550', '/embed/tv/63247/2/1'],
  ])(
    'builds fixed movie and episode endpoints for %s',
    (provider, origin, movie, tv) => {
      const movieUrl = new URL(buildTmdbProviderUrl({ tmdbId: 550, provider }));
      const tvUrl = new URL(
        buildTmdbProviderUrl({
          tmdbId: 63247,
          mediaType: 'tv',
          season: 2,
          episode: 1,
          provider,
        }),
      );
      expect(movieUrl.origin).toBe(origin);
      expect(movieUrl.pathname).toBe(movie);
      expect(tvUrl.origin).toBe(origin);
      expect(tvUrl.pathname).toBe(tv);
      expect(getTmdbPlayerSandbox(provider)).toBeUndefined();
    },
  );

  it('keeps popup and top navigation restrictions for cinesrc', () => {
    expect(getTmdbPlayerSandbox('cinesrc')).toContain('allow-scripts');
  });

  test.each([
    '1/../../admin',
    '123abc',
    '1e3',
    '0x10',
    '-1',
    '0',
    '9007199254740992',
    'https://localhost',
    '1?url=http://127.0.0.1',
  ])('rejects malformed id %s', (value) => {
    expect(normalizeTmdbId(value)).toBeNull();
    expect(normalizePositiveInteger(value, 2)).toBe(2);
  });

  it('accepts safe positive integers', () => {
    expect(normalizeTmdbId(' 123 ')).toBe(123);
    expect(normalizePositiveInteger('02')).toBe(2);
    expect(normalizeTmdbId(Number.MAX_SAFE_INTEGER)).toBe(
      Number.MAX_SAFE_INTEGER,
    );
    expect(normalizeTmdbId(Infinity)).toBeNull();
  });

  it('uses the documented CineSrc episode path and color parameter', () => {
    const url = new URL(
      buildTmdbProviderUrl({
        tmdbId: 1399,
        mediaType: 'tv',
        season: 2,
        episode: 3,
        accentColor: '#557efc',
        provider: 'cinesrc',
      }),
    );
    expect(url.pathname).toBe('/embed/tv/1399');
    expect(url.searchParams.get('s')).toBe('2');
    expect(url.searchParams.get('e')).toBe('3');
    expect(url.searchParams.get('color')).toBe('#557efc');
  });
});
