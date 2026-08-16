import maleUrl from '../assets/player/avatar-male.png'
import femaleUrl from '../assets/player/avatar-female.png'

export function getPlayerAvatarUrl(gender: string): string {
  return gender === '女' ? femaleUrl : maleUrl
}
