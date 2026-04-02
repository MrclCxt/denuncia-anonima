        // Gestão de Estado
        let currentStep = 1;
        const totalSteps = 3;
        let selectedCategory = '';

        // Simulação de Base de Dados (usando localStorage)
        const getDenuncias = () => JSON.parse(localStorage.getItem('denuncias') || '[]');
        const saveDenuncia = (d) => {
            const list = getDenuncias();
            list.push(d);
            localStorage.setItem('denuncias', JSON.stringify(list));
        };

        // Navegação entre secções
        function showSection(name) {
            document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));
            document.getElementById(`section-${name}`).classList.add('active');
            
            if(name === 'report') resetForm();
        }

        // UI de Seleção de Categoria
        document.querySelectorAll('input[name="categoria"]').forEach(input => {
            input.addEventListener('change', (e) => {
                document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                e.target.closest('.category-card').classList.add('selected');
                selectedCategory = e.target.value;
            });
        });

        function resetForm() {
            currentStep = 1;
            selectedCategory = '';
            document.getElementById('denunciaForm').reset();
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
            updateStepUI();
        }

        function nextPrev(n) {
            if (n == 1 && !validateStep()) return false;

            currentStep += n;

            if (currentStep > totalSteps) {
                submitDenuncia();
                return false;
            }

            updateStepUI();
        }

        function validateStep() {
            if (currentStep === 1) {
                if (!selectedCategory) {
                    customAlert('Por favor, selecione uma categoria.');
                    return false;
                }
            } else if (currentStep === 2) {
                const bairro = document.getElementById('bairro').value;
                const rua = document.getElementById('rua').value;
                const desc = document.getElementById('descricao').value;
                if (!bairro || !rua || !desc) {
                    customAlert('Preencha os campos obrigatórios (*)');
                    return false;
                }
            }
            return true;
        }

        function updateStepUI() {
            document.querySelectorAll('.form-step').forEach((s, idx) => {
                s.classList.toggle('hidden', idx !== currentStep - 1);
            });

            document.getElementById('step-indicator').innerText = `Passo ${currentStep} de ${totalSteps}`;
            document.getElementById('prevBtn').classList.toggle('hidden', currentStep === 1);
            document.getElementById('nextBtn').innerText = currentStep === totalSteps ? 'Finalizar Denúncia' : 'Próximo';
        }

        function generateProtocol() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        function submitDenuncia() {
            const protocol = generateProtocol();
            
            const data = {
                protocol: protocol,
                category: selectedCategory,
                bairro: document.getElementById('bairro').value,
                rua: document.getElementById('rua').value,
                referencia: document.getElementById('referencia').value,
                descricao: document.getElementById('descricao').value,
                status: 'denúncia recebida',
                date: new Date().toLocaleDateString('pt-PT')
            };

            saveDenuncia(data);
            
            document.getElementById('display-protocol').innerText = protocol;
            showSection('success');
        }

        function trackProtocol() {
            const protocolInput = document.getElementById('search-protocol').value.toUpperCase().trim();
            const resultDiv = document.getElementById('track-result');
            
            if (!protocolInput) return;

            const list = getDenuncias();
            const found = list.find(d => d.protocol === protocolInput);

            resultDiv.classList.remove('hidden');
            
            if (found) {
                const statusColors = {
                    'denúncia recebida': 'bg-slate-100 text-slate-700',
                    'em análise': 'bg-blue-100 text-blue-700',
                    'encaminhada': 'bg-yellow-100 text-yellow-700',
                    'concluída': 'bg-green-100 text-green-700'
                };

                resultDiv.innerHTML = `
                    <div class="border-t border-slate-100 pt-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase">Estado Atual</p>
                                <span class="status-badge ${statusColors[found.status]} uppercase">${found.status}</span>
                            </div>
                            <div class="text-right">
                                <p class="text-xs font-bold text-slate-400 uppercase">Data do Registo</p>
                                <p class="font-semibold">${found.date}</p>
                            </div>
                        </div>
                        <div class="space-y-3 bg-slate-50 p-4 rounded-xl text-sm">
                            <p><strong>Categoria:</strong> ${found.category}</p>
                            <p><strong>Local:</strong> ${found.rua}, ${found.bairro}</p>
                            <p class="italic text-slate-600 line-clamp-2">"${found.descricao}"</p>
                        </div>
                        <div class="mt-6 flex justify-between items-center text-xs text-slate-400">
                            <p>Protocolo: ${found.protocol}</p>
                            <p>Atualizado em: ${new Date().toLocaleDateString('pt-PT')}</p>
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="text-center py-10">
                        <div class="text-red-400 mb-2 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p class="font-bold text-slate-600">Protocolo não encontrado.</p>
                        <p class="text-sm text-slate-400">Verifique se digitou corretamente os 8 caracteres.</p>
                    </div>
                `;
            }
        }

        function customAlert(msg) {
            const div = document.createElement('div');
            div.className = "fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce";
            div.innerText = msg;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }

        window.onload = () => {
            const list = getDenuncias();
            if (list.length === 0) {
                const demo = {
                    protocol: 'DEMO1234',
                    category: 'Infraestrutura urbana',
                    bairro: 'Centro',
                    rua: 'Avenida da Liberdade',
                    descricao: 'Piso degradado causando riscos à circulação.',
                    status: 'em análise',
                    date: '10/05/2026'
                };
                saveDenuncia(demo);
            }
        };
