import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, uploadAvatar } from '@/lib/api';
import { formatAddress } from '@/lib/format';

export function Profile() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, profile, login, logout, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Sign in with Ethereum to manage your profile.
          </p>
          <button onClick={login} className="btn btn-primary">
            Sign In with Ethereum
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ nickname, avatarUrl });
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <div className="space-y-6">
          {/* Wallet Address */}
          <div>
            <label className="label">Wallet Address</label>
            <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm">
              {address}
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="label">Nickname</label>
            {isEditing ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter nickname"
                className="input"
                maxLength={50}
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                {profile?.nickname || 'No nickname set'}
              </div>
            )}
          </div>

          {/* Avatar URL */}
          <div>
            <label className="label">Avatar URL</label>
            {isEditing ? (
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="input"
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                {profile?.avatarUrl || 'No avatar set'}
              </div>
            )}
          </div>

          {/* Avatar Preview */}
          {(avatarUrl || profile?.avatarUrl) && (
            <div>
              <label className="label">Avatar Preview</label>
              <img
                src={isEditing ? avatarUrl : profile?.avatarUrl || ''}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/96';
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn btn-primary flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNickname(profile?.nickname || '');
                    setAvatarUrl(profile?.avatarUrl || '');
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary w-full"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="pt-6 border-t">
            <button onClick={logout} className="btn btn-danger w-full">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
