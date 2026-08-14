import { Video } from '@/lib/types';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyDv1DH5uu92Q9v27Fkv8kqkh_AChr2ST0M';

export async function fetchPlaylistVideos(playlistId: string): Promise<Video[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache results for 1 hour
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: 
        item.snippet.thumbnails?.high?.url || 
        item.snippet.thumbnails?.medium?.url || 
        item.snippet.thumbnails?.default?.url || 
        '',
      videoId: item.snippet.resourceId.videoId,
      description: item.snippet.description
    }));
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    return [];
  }
}
