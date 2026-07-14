<!-- src/components/UploadGame.vue -->
<template>
  <el-button type="primary" size="small" @click="showDialog = true" :icon="Upload">
    上传游戏
  </el-button>

  <el-dialog v-model="showDialog" title="添加游戏" width="500px" :close-on-click-modal="false" :lock-scroll="false">
    <el-form :model="form" label-width="80px">
      <!-- 上传方式切换 -->
      <el-form-item label="上传方式">
        <el-radio-group v-model="uploadType">
          <el-radio value="url">图片URL</el-radio>
          <el-radio value="file">选择文件</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 文件选择（仅当 uploadType === 'file'） -->
      <el-form-item v-if="uploadType === 'file'" label="封面图片" required>
        <input type="file" accept="image/*" @change="onFileChange" ref="fileInput" style="display: none" />
        <el-button @click="fileInput.click()">选择图片</el-button>
        <span v-if="file" style="margin-left: 10px">{{ file.name }}</span>
        <span v-else style="color: #999; margin-left: 10px">未选择</span>
      </el-form-item>

      <!-- URL 输入（仅当 uploadType === 'url'） -->
      <el-form-item v-if="uploadType === 'url'" label="图片URL" required>
        <el-input v-model="imageUrl" placeholder="请输入图片URL，如 https://example.com/image.jpg" />
      </el-form-item>

      <el-form-item label="游戏名" required>
        <el-input v-model="form.name" placeholder="请输入游戏名" />
      </el-form-item>
      <el-form-item label="年份">
        <el-input-number v-model="form.year" :min="2000" :max="new Date().getFullYear()" />
      </el-form-item>
      <el-form-item label="月份">
        <el-input-number v-model="form.month" :min="1" :max="12" />
      </el-form-item>
      <el-form-item label="工作室">
        <el-input v-model="form.studio" placeholder="可选" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" :loading="uploading" @click="submit">上传并添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

const showDialog = ref(false)
const file = ref(null)
const fileInput = ref(null)
const uploadType = ref('url')           // 'file' 或 'url'
const imageUrl = ref('')                 // URL 输入框的值
const uploading = ref(false)

const reload = inject('reload', null)

const form = ref({
  name: '',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  studio: ''
})

const onFileChange = (e) => {
  const f = e.target.files[0]
  if (f) file.value = f
}

const submit = async () => {
  // 1. 验证游戏名
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入游戏名')
    return
  }

  // 2. 验证图片来源
  if (uploadType.value === 'file') {
    if (!file.value) {
      ElMessage.warning('请选择图片')
      return
    }
  } else {
    if (!imageUrl.value.trim()) {
      ElMessage.warning('请输入图片URL')
      return
    }
    try {
      new URL(imageUrl.value) // 简单校验URL格式
    } catch {
      ElMessage.warning('请输入有效的URL')
      return
    }
  }

  uploading.value = true
  try {
    // 3. 上传到 imgBB
    const formData = new FormData()

    if (uploadType.value === 'file') {
      formData.append('image', file.value)
    } else {
      formData.append('image', imageUrl.value.trim())
    }
    formData.append('key', import.meta.env.VITE_IMGBB_KEY)
    formData.append('name', form.value.name)

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })
    const result = await res.json()
    if (!result.success) {
      throw new Error(result.error?.message || '图片上传失败')
    }
    const coverUrl = result.data.url

    // 4. 组装游戏对象
    // const now = new Date()
    // const id = `image-${Date.now()}.jpg__${form.value.year || now.getFullYear()}-${form.value.month || (now.getMonth() + 1)}`
    // const newGame = {
    //   id,
    //   name: form.value.name.trim(),
    //   cover: coverUrl,
    //   year: form.value.year || null,
    //   month: form.value.month || null,
    //   studio: form.value.studio || form.value.name.trim()
    // }
    const gameData = {
      name: form.value.name.trim(),
      cover: coverUrl,
      studio: form.value.studio || form.value.name.trim()
    };
    const recordData = {
      year: form.value.year || null,
      month: form.value.month || null
    };
    const payload = { game: gameData, record: recordData };

    // 5. 调用本地 /api/games 写入 public/games.json
    const addRes = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!addRes.ok) {
      let errMsg = `HTTP ${addRes.status}`;
      try {
        const errData = await addRes.json();
        if (errData.error) {
          errMsg = errData.error;
        }
      } catch (_) {
        errMsg = `${errMsg} ${addRes.statusText}`;
      }
      throw new Error(errMsg);
    }

    const addResult = await addRes.json()
    if (!addResult.success) {
      throw new Error(addResult.error || '添加失败')
    }

    ElMessage.success('游戏添加成功！')
    showDialog.value = false
    // 重置表单
    form.value = {
      name: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      studio: ''
    }
    file.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    imageUrl.value = ''
    uploadType.value = 'url'   // 重置为默认方式
    if (reload) {
      reload()
    } else {
      window.location.reload()
    }
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    uploading.value = false
  }
}
</script>